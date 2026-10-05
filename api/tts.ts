import type { IncomingMessage, ServerResponse } from 'http';

// In-memory cache for serverless container lifecycle
const ttsCache = new Map<string, string>();

function cleanVietnameseText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, ' ') // Strip SSML tags
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchNativeVietnameseSpeech(text: string): Promise<string> {
  const clean = cleanVietnameseText(text);
  if (!clean) {
    throw new Error('Empty text content');
  }

  // Google Translate TTS chunk size limit is ~180 characters
  const chunks: string[] = [];
  if (clean.length <= 180) {
    chunks.push(clean);
  } else {
    const sentences = clean.split(/(?<=[.?!,;])\s+/);
    let cur = '';
    for (const s of sentences) {
      if ((cur + ' ' + s).length <= 180) {
        cur = cur ? cur + ' ' + s : s;
      } else {
        if (cur) chunks.push(cur);
        cur = s;
      }
    }
    if (cur) chunks.push(cur);
  }

  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(chunk)}`;
    const resp = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    });

    if (!resp.ok) {
      throw new Error(`Native Vietnamese TTS response code: ${resp.status}`);
    }

    const arrBuf = await resp.arrayBuffer();
    buffers.push(Buffer.from(arrBuf));
  }

  const fullBuffer = Buffer.concat(buffers);
  return `data:audio/mp3;base64,${fullBuffer.toString('base64')}`;
}

export default async function handler(req: any, res: any) {
  // Enable CORS for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { text, ssml } = body;
    const content = (ssml || text || '').trim();

    if (!content) {
      return res.status(400).json({ error: 'Text or SSML is required' });
    }

    const clean = cleanVietnameseText(content);
    const cacheKey = `vi_native_${clean}`;

    if (ttsCache.has(cacheKey)) {
      return res.json({ audioUrl: ttsCache.get(cacheKey), cached: true });
    }

    try {
      const audioUrl = await fetchNativeVietnameseSpeech(content);
      ttsCache.set(cacheKey, audioUrl);
      return res.json({ audioUrl, cached: false });
    } catch (fetchErr: any) {
      console.warn('[Vercel TTS] Fetch error, returning fallback:', fetchErr?.message);
    }

    return res.json({
      fallback: true,
      reason: 'use_browser_native',
      message: 'Using client-side native Vietnamese speech synthesis',
    });
  } catch (err: any) {
    return res.status(500).json({
      fallback: true,
      reason: 'error',
      message: err?.message || 'Server error',
    });
  }
}
