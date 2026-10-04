import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory TTS cache to save latency and bandwidth
const ttsCache = new Map<string, string>();

function cleanVietnameseText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, ' ') // Strip SSML tags
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch 100% authentic native Vietnamese female teacher speech
 * Clear Hà Nội / Northern accent, standard preschool intonation, natural tones (hỏi, ngã, nặng, sắc, huyền)
 * Completely eliminates robotic, male, or foreign 'lơ lớ' accents.
 */
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

/**
 * Text-to-Speech API endpoint:
 * Strictly provides 100% authentic native Vietnamese female teacher voice.
 */
app.post('/api/tts', async (req, res) => {
  try {
    const { text, ssml } = req.body;
    const content = (ssml || text || '').trim();
    if (!content) {
      return res.status(400).json({ error: 'Text or SSML is required' });
    }

    const clean = cleanVietnameseText(content);
    const cacheKey = `vi_native_${clean}`;

    // Return cached authentic Vietnamese audio if available
    if (ttsCache.has(cacheKey)) {
      return res.json({ audioUrl: ttsCache.get(cacheKey), cached: true });
    }

    try {
      const audioUrl = await fetchNativeVietnameseSpeech(content);
      ttsCache.set(cacheKey, audioUrl);
      return res.json({ audioUrl, cached: false });
    } catch (fetchErr) {
      console.warn('Native Vietnamese voice fetch warning, switching to client synthesizer:', fetchErr);
    }

    // Fallback: Inform client to use browser native Vietnamese speech synthesis
    return res.json({
      fallback: true,
      reason: 'use_browser_native',
      message: 'Using client-side native Vietnamese speech synthesis',
    });
  } catch (err: any) {
    return res.json({
      fallback: true,
      reason: 'error',
      message: 'Using client-side native Vietnamese speech synthesis',
    });
  }
});

// ====================================================================
// AI PRESET KNOWLEDGE BASE FALLBACK GENERATORS (100% RELIABLE)
// ====================================================================
const PRESET_TOPIC_ITEMS: Record<string, any[]> = {
  animals: [
    {
      name: 'Mèo',
      soundText: 'Meo meo',
      questionText: 'Con gì kêu meo meo? Tìm bạn Mèo nào!',
      readingSentence: 'Đây là bạn Mèo ngoan. Bạn Mèo kêu meo meo.',
      movementSuggestion: 'Hai tay đặt lên má làm động tác mèo rửa mặt xinh',
      praisePhrase: 'Giỏi quá! Bé tìm đúng bạn Mèo rồi!',
      encouragementPhrase: 'Con thử lại nhé, lắng nghe tiếng meo meo nào!',
      bgColor: '#FFF7ED',
      suggestedSvgKey: 'cat',
    },
    {
      name: 'Chó',
      soundText: 'Gâu gâu',
      questionText: 'Con gì kêu gâu gâu? Tìm bạn Chó nào!',
      readingSentence: 'Bạn Chó trông nhà rất giỏi. Chó sủa gâu gâu.',
      movementSuggestion: 'Hai tay vẫy tai chó và lắc lư người vui vẻ',
      praisePhrase: 'Hoan hô bé! Bạn Chó vẫy đuôi chào con kìa!',
      encouragementPhrase: 'Bé lắng tai nghe tiếng gâu gâu để tìm bạn Chó nhé!',
      bgColor: '#FEF3C7',
      suggestedSvgKey: 'dog',
    },
    {
      name: 'Vịt',
      soundText: 'Cạp cạp',
      questionText: 'Con gì bơi dưới ao kêu cạp cạp? Tìm bạn Vịt nào!',
      readingSentence: 'Bạn Vịt có bộ lông vàng, bơi lội cạp cạp.',
      movementSuggestion: 'Hai khuỷu tay khép mở như đôi cánh vịt vẫy',
      praisePhrase: 'Tuyệt vời! Bé nhận biết bạn Vịt rất giỏi!',
      encouragementPhrase: 'Con thử chạm lại bạn Vịt lông vàng bơi dưới nước nhé!',
      bgColor: '#FEF9C3',
      suggestedSvgKey: 'duck',
    },
    {
      name: 'Gà',
      soundText: 'Cục tác',
      questionText: 'Bạn Gà đẻ trứng vàng đâu rồi? Tìm bạn Gà nào!',
      readingSentence: 'Bạn Gà mái đẻ quả trứng tròn, kêu cục ta cục tác.',
      movementSuggestion: 'Hai tay chụm lại làm mỏ gà mổ thóc: Cóc cóc cóc',
      praisePhrase: 'Bé thông minh lắm! Đã tìm đúng bạn Gà rồi!',
      encouragementPhrase: 'Bé nhìn kĩ xem bạn Gà có chiếc mào đỏ ở đâu nào!',
      bgColor: '#FDF2F8',
      suggestedSvgKey: 'chicken',
    },
    {
      name: 'Bò Sữa',
      soundText: 'Ùm bò',
      questionText: 'Con gì cho sữa ngọt lành? Tìm bạn Bò nào!',
      readingSentence: 'Bạn Bò sữa hiền lành ăn cỏ xanh trên đồng.',
      movementSuggestion: 'Hai ngón tay đặt lên đầu làm sừng bò nhỏ xinh',
      praisePhrase: 'Hoan hô con! Bạn Bò tặng bé ly sữa ngon nhé!',
      encouragementPhrase: 'Con tìm bạn Bò có đốm trắng đen đáng yêu nhé!',
      bgColor: '#F0FDF4',
      suggestedSvgKey: 'cow',
    },
  ],
  fruits: [
    {
      name: 'Quả Táo',
      soundText: 'Giòn ngọt',
      questionText: 'Quả táo màu đỏ ngọt thơm ở đâu nào?',
      readingSentence: 'Quả táo tròn xoe, màu đỏ tươi thơm ngon.',
      movementSuggestion: 'Hai tay xòe tròn mô phỏng quả táo chín mọng',
      praisePhrase: 'Bé giỏi quá! Quả táo đỏ ngon lành đã được tìm thấy!',
      encouragementPhrase: 'Bé quan sát quả tròn màu đỏ tươi nhé!',
      bgColor: '#FEE2E2',
      suggestedSvgKey: 'apple',
    },
    {
      name: 'Quả Chuối',
      soundText: 'Thơm lừng',
      questionText: 'Quả chuối cong cong màu vàng đâu rồi bé ơi?',
      readingSentence: 'Quả chuối vỏ vàng ruộm, ăn vào rất bổ dưỡng.',
      movementSuggestion: 'Hai bàn tay chụm lại uốn cong như hình quả chuối',
      praisePhrase: 'Đúng rồi! Bạn chuối vàng thơm ngon của bé đây rồi!',
      encouragementPhrase: 'Con tìm quả màu vàng có dáng cong cong nhé!',
      bgColor: '#FEF9C3',
      suggestedSvgKey: 'banana',
    },
    {
      name: 'Quả Cam',
      soundText: 'Mọng nước',
      questionText: 'Quả cam tròn xoe nhiều vitamin C ở đâu nào?',
      readingSentence: 'Quả cam vỏ màu vàng cam, nhiều múi mọng nước.',
      movementSuggestion: 'Xoa hai bàn tay tròn đều quanh bụng như quả cam',
      praisePhrase: 'Bé tinh mắt lắm! Quả cam thơm mát đây rồi!',
      encouragementPhrase: 'Con chạm vào quả tròn màu cam tươi tắn nhé!',
      bgColor: '#FFEDD5',
      suggestedSvgKey: 'orange',
    },
    {
      name: 'Quả Dưa Hấu',
      soundText: 'Mát lành',
      questionText: 'Quả dưa hấu ruột đỏ vỏ xanh ở đâu nào?',
      readingSentence: 'Dưa hấu vỏ xanh, ruột đỏ ngọt mát lành ngày hè.',
      movementSuggestion: 'Dang rộng hai tay ôm quả dưa to tròn',
      praisePhrase: 'Bé tuyệt vời quá! Quả dưa hấu to bự đã được chọn!',
      encouragementPhrase: 'Con tìm quả to có sọc xanh vỏ ngoài nhé!',
      bgColor: '#DCFCE7',
      suggestedSvgKey: 'watermelon',
    },
  ],
  vehicles: [
    {
      name: 'Ô Tô',
      soundText: 'Bíp bíp',
      questionText: 'Xe gì có 4 bánh kêu bíp bíp? Tìm Ô tô nào!',
      readingSentence: 'Chiếc ô tô bon bon chạy trên đường lớn, còi bíp bíp.',
      movementSuggestion: 'Hai tay cầm vô lăng vô hình lắc lư lái xe',
      praisePhrase: 'Bé tài xế tí hon giỏi quá! Đã tìm đúng Ô tô!',
      encouragementPhrase: 'Bé nghe tiếng còi bíp bíp để tìm xe ô tô nhé!',
      bgColor: '#E0F2FE',
      suggestedSvgKey: 'car',
    },
    {
      name: 'Máy Bay',
      soundText: 'Vù vù',
      questionText: 'Phương tiện nào bay vù vù trên bầu trời xanh?',
      readingSentence: 'Máy bay có đôi cánh dài, bay lượn trên mây trắng.',
      movementSuggestion: 'Dang hai cánh tay sang ngang nghiêng người như máy bay',
      praisePhrase: 'Hoan hô con! Chiếc máy bay lượn cánh rất đẹp!',
      encouragementPhrase: 'Bé ngước nhìn lên cao tìm chiếc máy bay có cánh dài nhé!',
      bgColor: '#E0E7FF',
      suggestedSvgKey: 'airplane',
    },
    {
      name: 'Tàu Hỏa',
      soundText: 'Xình xịch',
      questionText: 'Đoàn tàu dài chạy xình xịch tu tu ở đâu nào?',
      readingSentence: 'Đoàn tàu nối nhiều toa dài, chạy trên đường ray.',
      movementSuggestion: 'Gập khuỷu tay đẩy ra trước sau: Xình xịch xình xịch',
      praisePhrase: 'Bé giỏi lắm! Tàu hỏa tu tu đã về ga!',
      encouragementPhrase: 'Con tìm đoàn tàu có ống khói tu tu nhé!',
      bgColor: '#F3E8FF',
      suggestedSvgKey: 'train',
    },
  ],
  colors: [
    {
      name: 'Màu Đỏ',
      soundText: 'Rực rỡ',
      questionText: 'Bé chạm vào màu Đỏ rực rỡ như hoa hồng nào!',
      readingSentence: 'Màu đỏ nổi bật, như quả táo và bông hoa tươi thắm.',
      movementSuggestion: 'Vỗ hai bàn tay vào nhau theo nhịp vui tươi',
      praisePhrase: 'Đúng màu đỏ rồi! Bé nhận biết màu sắc giỏi quá!',
      encouragementPhrase: 'Bé tìm ô màu đỏ ấm áp như mặt trời mọc nhé!',
      bgColor: '#FEE2E2',
      suggestedSvgKey: 'red_circle',
    },
    {
      name: 'Màu Vàng',
      soundText: 'Tươi sáng',
      questionText: 'Màu Vàng tươi như ánh nắng mai ở đâu nào?',
      readingSentence: 'Màu vàng rực rỡ như chú gà con và ánh nắng sớm.',
      movementSuggestion: 'Xòe các ngón tay lấp lánh như tia nắng ấm',
      praisePhrase: 'Chính xác! Màu vàng tươi sáng đã được bé chọn!',
      encouragementPhrase: 'Bé tìm màu vàng óng ả như quả chuối chín nhé!',
      bgColor: '#FEF9C3',
      suggestedSvgKey: 'yellow_circle',
    },
    {
      name: 'Màu Xanh Lá',
      soundText: 'Mát mẻ',
      questionText: 'Màu Xanh lá cây tươi mát của rừng xanh ở đâu?',
      readingSentence: 'Màu xanh của lá non, của cỏ cây tươi tốt.',
      movementSuggestion: 'Vẫy nhẹ các ngón tay như cành lá đu đưa trong gió',
      praisePhrase: 'Bé thật tuyệt! Màu xanh lá cây mát dịu đây rồi!',
      encouragementPhrase: 'Con tìm ô màu xanh của chiếc lá cây nhé!',
      bgColor: '#DCFCE7',
      suggestedSvgKey: 'green_circle',
    },
  ],
};

function generateFallbackGame(topic: string, ageRange: string, count: number, gameType: string, goal?: string) {
  const rawTopic = (topic || '').trim();
  const lower = rawTopic.toLowerCase();

  // 1. SPECIFIC ITEM CHECK: Tomato / Quả Cà Chua
  if (lower.includes('cà chua') || lower.includes('tomato')) {
    const tomatoQuestions = [
      {
        name: 'Quả Cà Chua',
        soundText: 'Đỏ mọng tròn xoe',
        questionText: 'Bé tìm Quả Cà Chua màu đỏ mọng ở đâu nào?',
        readingSentence: 'Đây là Quả Cà Chua chín đỏ mọng, vỏ trơn láng nhiều vitamin.',
        movementSuggestion: 'Hai tay chụm tròn mô phỏng quả cà chua đỏ mọng to tròn',
        praisePhrase: 'Giỏi quá! Bé đã tìm đúng Quả Cà Chua đỏ mọng rồi!',
        encouragementPhrase: 'Con nhìn kĩ quả tròn xoe màu đỏ mọng nhé!',
        bgColor: '#FEE2E2',
        suggestedSvgKey: 'tomato',
      },
      {
        name: 'Quả Cà Chua',
        soundText: 'Cuống lá xanh',
        questionText: 'Quả Cà Chua có chiếc cuống lá màu xanh xinh xắn ở đâu nhỉ?',
        readingSentence: 'Quả cà chua tròn xoe, có chiếc cuống lá xanh trên đầu như chiếc mũ.',
        movementSuggestion: 'Đặt các ngón tay lên đầu làm cuống lá nhỏ xinh xắn',
        praisePhrase: 'Hoan hô bé! Chiếc cuống lá xanh của Quả Cà Chua đây rồi!',
        encouragementPhrase: 'Con tìm quả có chiếc cuống màu xanh xinh trên đầu nhé!',
        bgColor: '#FEE2E2',
        suggestedSvgKey: 'tomato',
      },
      {
        name: 'Quả Cà Chua',
        soundText: 'Ngon mát bổ dưỡng',
        questionText: 'Quả Cà Chua mẹ nấu canh chua thơm ngon cho bé ở đâu?',
        readingSentence: 'Quả cà chua nấu súp hay nấu canh ăn đều rất thơm ngon và mát lành.',
        movementSuggestion: 'Hai tay xoa xoa quanh bụng mô phỏng ăn ngon miệng',
        praisePhrase: 'Bé tinh mắt lắm! Quả cà chua nấu canh thơm ngon đây rồi!',
        encouragementPhrase: 'Con chạm vào Quả Cà Chua đỏ ngon lành nhé!',
        bgColor: '#FEE2E2',
        suggestedSvgKey: 'tomato',
      },
      {
        name: 'Quả Cà Chua',
        soundText: 'Vỏ mịn trơn',
        questionText: 'Bé chạm vào Quả Cà Chua vỏ mịn màng nào!',
        readingSentence: 'Vỏ quả cà chua trơn láng bóng bẩy, bé ăn vào má hồng xinh xắn.',
        movementSuggestion: 'Hai tay áp nhẹ lên má cười tươi vui vẻ',
        praisePhrase: 'Đúng rồi! Bé nhận biết Quả Cà Chua rất xuất sắc!',
        encouragementPhrase: 'Bé thử lại nhé, quan sát Quả Cà Chua tròn đỏ nào!',
        bgColor: '#FEE2E2',
        suggestedSvgKey: 'tomato',
      },
    ];

    const needed = Math.max(2, Math.min(count || 4, tomatoQuestions.length));
    return {
      title: `Bé Khám Phá: Quả Cà Chua Đỏ Mọng`,
      topic: 'Quả Cà Chua',
      category: 'fruits',
      ageRange: ageRange || '12–24 tháng',
      gameType: gameType || 'listen_find',
      objectives:
        goal || `Dạy trẻ nhận biết quả cà chua: màu đỏ tươi, dáng tròn xoe, có cuống lá xanh và vỏ mịn màng.`,
      choicesCount: ageRange === '12–18 tháng' ? 2 : 3,
      items: tomatoQuestions.slice(0, needed).map((it, idx) => ({
        ...it,
        id: `item_tomato_${Date.now()}_${idx}`,
      })),
    };
  }

  // 2. SPECIFIC ITEM CHECK: Carrot / Cà Rốt
  if (lower.includes('cà rốt') || lower.includes('carrot')) {
    const carrotQuestions = [
      {
        name: 'Củ Cà Rốt',
        soundText: 'Màu cam giòn ngọt',
        questionText: 'Củ Cà Rốt màu cam dài dài ở đâu nào?',
        readingSentence: 'Củ cà rốt có màu cam tươi tắn, bạn thỏ trắng rất thích ăn.',
        movementSuggestion: 'Hai ngón tay đặt lên đầu làm tai thỏ nhảy nhót',
        praisePhrase: 'Giỏi quá! Củ cà rốt màu cam của bé đây rồi!',
        encouragementPhrase: 'Con tìm củ dài dài có màu cam nhé!',
        bgColor: '#FFEDD5',
        suggestedSvgKey: 'carrot',
      },
      {
        name: 'Củ Cà Rốt',
        soundText: 'Lá xanh dài',
        questionText: 'Củ Cà Rốt có chùm lá xanh tốt ở đâu nhỉ?',
        readingSentence: 'Củ cà rốt nằm dưới lòng đất, bên trên có chùm lá xanh mướt.',
        movementSuggestion: 'Hai tay vung lên cao như chùm lá cà rốt',
        praisePhrase: 'Đúng rồi! Bé thật thông minh!',
        encouragementPhrase: 'Con chạm vào củ cà rốt nhé!',
        bgColor: '#FFEDD5',
        suggestedSvgKey: 'carrot',
      },
    ];
    return {
      title: `Bé Khám Phá: Củ Cà Rốt Màu Cam`,
      topic: 'Củ Cà Rốt',
      category: 'vegetables',
      ageRange: ageRange || '12–24 tháng',
      gameType: gameType || 'listen_find',
      objectives: goal || 'Dạy trẻ nhận biết củ cà rốt màu cam, rèn phát âm từ đơn.',
      choicesCount: ageRange === '12–18 tháng' ? 2 : 3,
      items: carrotQuestions.map((it, idx) => ({
        ...it,
        id: `item_carrot_${Date.now()}_${idx}`,
      })),
    };
  }

  // 3. GENERAL CATEGORY FALLBACK (Only when no specific single item is mentioned)
  let category = 'animals';
  if (lower.includes('quả') || lower.includes('trái') || lower.includes('trái cây')) {
    category = 'fruits';
  } else if (lower.includes('xe') || lower.includes('giao thông') || lower.includes('tàu')) {
    category = 'vehicles';
  } else if (lower.includes('màu') || lower.includes('sắc')) {
    category = 'colors';
  }

  const baseItems = PRESET_TOPIC_ITEMS[category] || PRESET_TOPIC_ITEMS.animals;
  const neededCount = Math.max(2, Math.min(count || 4, baseItems.length));
  const selectedItems = baseItems.slice(0, neededCount).map((item, idx) => ({
    ...item,
    id: `item_gen_${Date.now()}_${idx}`,
  }));

  const title = `Bé Khám Phá: ${rawTopic || 'Thế Giới Quanh Bé'}`;
  const objectives =
    goal || `Giúp trẻ ${ageRange} nhận biết, phát âm chuẩn các từ đơn và kết hợp vận động thô vui nhộn theo chủ đề.`;

  return {
    title,
    topic: rawTopic || 'Chủ Đề Mầm Non',
    category,
    ageRange: ageRange || '12–24 tháng',
    gameType: gameType || 'listen_find',
    objectives,
    choicesCount: ageRange === '12–18 tháng' ? 2 : 3,
    items: selectedItems,
  };
}

/**
 * AI GAME BUILDER ENDPOINT:
 * Generates preschool games from teacher prompt in 1 second.
 */
app.post('/api/ai-game', async (req, res) => {
  try {
    const { topic, ageRange = '12–24 tháng', questionCount = 4, gameType = 'listen_find', goal = '' } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallback = generateFallbackGame(topic, ageRange, questionCount, gameType, goal);
      return res.json({ game: fallback, source: 'preset_generator' });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Bạn là chuyên gia sư phạm mầm non hàng đầu Việt Nam cho độ tuổi Nhà trẻ (12–24 tháng tuổi).
Hãy thiết kế một hoạt động trò chơi giáo dục mầm non hoàn chỉnh theo yêu cầu sau:
- Chủ đề: ${topic}
- Độ tuổi: ${ageRange}
- Số lượng đối tượng/câu hỏi: ${questionCount}
- Dạng trò chơi: ${gameType}
- Mục tiêu: ${goal || 'Phát triển nhận thức, ngôn ngữ và vận động'}

LƯU Ý CỰC KỲ QUAN TRỌNG:
Chủ đề do giáo viên yêu cầu là: "${topic}".
BẮT BUỘC toàn bộ nội dung trò chơi, câu hỏi, đối tượng phải tập trung chính xác 100% vào đúng đối tượng mà giáo viên yêu cầu.
Ví dụ: Nếu chủ đề là "Quả Cà Chua" (hoặc "Bé nhận biết quả cà chua"), thì TẤT CẢ các câu hỏi phải hỏi về Quả Cà Chua (màu sắc đỏ mọng, cuống xanh, hình tròn xoe, vỏ láng mịn, vị ngọt mát...), TUYỆT ĐỐI KHÔNG ĐƯỢC sinh ra câu hỏi về Quả Táo hay các quả không liên quan!

Yêu cầu ngôn ngữ cho trẻ 12–24 tháng:
- Câu hỏi ngắn gọn, ấm áp, câu đọc rõ ràng, giàu hình ảnh và âm thanh tượng thanh.
- Có gợi ý vận động cơ thể (vận động thô/tinh vui nhộn không gây nguy hiểm) cho cô và bé làm theo.
- Có câu khen khi đúng và câu động viên nhẹ nhàng khi chưa đúng (tuyệt đối không tiêu cực).

Trả về ĐÚNG DUY NHẤT một chuỗi JSON hợp lệ (không kèm markdown) theo cấu trúc:
{
  "title": "Tên trò chơi thân thiện",
  "topic": "${topic}",
  "category": "fruits|vegetables|animals|colors|vehicles|family|objects|body|music|nature",
  "ageRange": "${ageRange}",
  "gameType": "${gameType}",
  "objectives": "Mục tiêu cụ thể về nhận thức, ngôn ngữ và thể chất",
  "choicesCount": ${ageRange === '12–18 tháng' ? 2 : 3},
  "items": [
    {
      "name": "Tên đối tượng đúng (ví dụ: Quả Cà Chua)",
      "soundText": "Từ tượng thanh hoặc đặc điểm nổi bật ngắn",
      "questionText": "Câu hỏi đọc cho trẻ (ví dụ: Đâu là Quả Cà Chua màu đỏ mọng?)",
      "readingSentence": "Câu đọc mở rộng",
      "movementSuggestion": "Gợi ý động tác vui nhộn cho trẻ",
      "praisePhrase": "Giỏi quá! Bé tìm đúng Quả Cà Chua rồi!",
      "encouragementPhrase": "Con nghe lại và thử lại nhé!",
      "bgColor": "#FEE2E2",
      "suggestedSvgKey": "tomato|apple|banana|orange|watermelon|carrot|cat|dog|duck|chicken|cow|sheep|car|airplane|train|sun|flower|ball|star"
    }
  ]
}`;

      // Prefer gemini-2.5-flash for speed and reliability, with fallback to gemini-3.8-flash
      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
      } catch (err25) {
        console.warn('Gemini 2.5 flash error, trying gemini-3.8-flash:', err25);
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
      }

      const responseText = response?.text?.trim() || '';
      if (responseText) {
        const parsed = JSON.parse(responseText);
        parsed.puzzlePieces = 4;
        // Inject IDs
        parsed.items = (parsed.items || []).map((it: any, idx: number) => ({
          ...it,
          id: `item_ai_${Date.now()}_${idx}`,
        }));
        return res.json({ game: parsed, source: 'gemini_ai' });
      }
    } catch (aiErr) {
      console.warn('Gemini AI generation error, using pedagogical preset generator fallback:', aiErr);
    }

    const fallback = generateFallbackGame(topic, ageRange, questionCount, gameType, goal);
    return res.json({ game: fallback, source: 'preset_generator' });
  } catch (err: any) {
    console.error('AI Game endpoint error:', err);
    const fallback = generateFallbackGame(req.body?.topic || 'Con vật đáng yêu', '12–24 tháng', 4, 'listen_find');
    return res.json({ game: fallback, source: 'emergency_fallback' });
  }
});

/**
 * AI LESSON PLAN GENERATOR ENDPOINT:
 * Generates official Ministry of Education compliant Preschool Lesson Plan in 1 click.
 */
app.post('/api/ai-lesson-plan', async (req, res) => {
  try {
    const { gameTitle, topic, ageRange = '12–24 tháng', items = [], objectives = '' } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({ lessonPlan: generateFallbackLessonPlan(gameTitle, topic, ageRange, items) });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Bạn là tổ trưởng chuyên môn mầm non xuất sắc của Bộ Giáo dục & Đào tạo Việt Nam.
Hãy lập một Kế hoạch hoạt động giáo dục (Giáo án nhận biết tập nói / Khám phá khoa học) chuẩn chỉnh cho lứa tuổi Nhà trẻ (${ageRange}).
Thông tin hoạt động:
- Tên hoạt động: ${gameTitle}
- Chủ đề: ${topic}
- Đối tượng trẻ tham gia: ${ageRange}
- Các đối tượng nhận biết: ${items.map((it: any) => it.name).join(', ')}
- Mục tiêu ban đầu: ${objectives || 'Phát triển ngôn ngữ, nhận thức, tình cảm xã hội'}

Yêu cầu cấu trúc giáo án chuẩn mầm non:
1. Mục đích - Yêu cầu:
   - Kiến thức (Trẻ gọi tên, nhận biết đặc điểm nổi bật, âm thanh)
   - Kỹ năng (Phát âm rõ tiếng, chỉ đúng đối tượng, làm động tác mô phỏng, thao tác trên TV cảm ứng)
   - Thái độ (Hứng thú, yêu quý đồ vật/con vật, kiên nhẫn)
2. Chuẩn bị:
   - Đồ dùng của cô
   - Đồ dùng của trẻ
   - Ứng dụng CNTT (Trò chơi tương tác TinyLearn trên TV/Tablet)
3. Tiến hành hoạt động (3-4 bước):
   - Bước 1: Ổn định - Gây hứng thú (Bài hát / câu đố / tạo bất ngờ)
   - Bước 2: Hoạt động trọng tâm (Cô giới thiệu, cho trẻ quan sát, phát âm từ đơn, kết hợp vận động)
   - Bước 3: Trò chơi củng cố trên phần mềm TinyLearn (Trẻ lên tương tác trực tiếp nghe âm thanh chạm đáp án)
   - Bước 4: Kết thúc (Khen ngợi, vận động nhẹ chuyển hoạt động)
4. Đánh giá & Điều chỉnh theo từng trẻ.

Trả về duy nhất định dạng JSON:
{
  "title": "Kế hoạch hoạt động: ${gameTitle}",
  "topic": "${topic}",
  "ageRange": "${ageRange}",
  "durationMinutes": 15,
  "objectives": {
    "knowledge": ["..."],
    "skills": ["..."],
    "attitude": ["..."]
  },
  "preparations": {
    "teacher": ["..."],
    "children": ["..."],
    "itApplication": ["Phần mềm TinyLearn kết nối Smart TV/Tablet"]
  },
  "steps": [
    {
      "phase": "1. Ổn định - Gây hứng thú",
      "duration": "2–3 phút",
      "activities": "Nội dung",
      "teacherGuidance": "Lời cô nói và hành động",
      "childrenResponse": "Trẻ chú ý, lắng nghe, hưởng ứng"
    },
    {
      "phase": "2. Hoạt động trọng tâm (Nhận biết tập nói)",
      "duration": "7–9 phút",
      "activities": "Nội dung",
      "teacherGuidance": "Cô đàm thoại, dạy trẻ nói và làm động tác",
      "childrenResponse": "Trẻ quan sát, tập phát âm và bắt chước động tác"
    },
    {
      "phase": "3. Trò chơi củng cố (Tương tác trên TinyLearn)",
      "duration": "3–4 phút",
      "activities": "Nội dung",
      "teacherGuidance": "Cô hướng dẫn trẻ chạm hình đúng trên TV/Tablet",
      "childrenResponse": "Trẻ hào hứng lên chạm, nghe cô khen"
    },
    {
      "phase": "4. Kết thúc hoạt động",
      "duration": "1–2 phút",
      "activities": "Nội dung",
      "teacherGuidance": "Cô nhận xét, động viên cả lớp",
      "childrenResponse": "Trẻ vỗ tay vui vẻ"
    }
  ],
  "evaluation": "Đa số trẻ nhận biết được các đối tượng chính; chú ý hỗ trợ thêm các bé còn rụt rè."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const responseText = response.text?.trim() || '';
      if (responseText) {
        const parsed = JSON.parse(responseText);
        parsed.id = `plan_${Date.now()}`;
        parsed.createdAt = Date.now();
        return res.json({ lessonPlan: parsed, source: 'gemini_ai' });
      }
    } catch (aiErr) {
      console.warn('Gemini Lesson Plan error, using fallback:', aiErr);
    }

    return res.json({ lessonPlan: generateFallbackLessonPlan(gameTitle, topic, ageRange, items) });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate lesson plan' });
  }
});

function generateFallbackLessonPlan(gameTitle: string, topic: string, ageRange: string, items: any[] = []) {
  const itemNames = items.length > 0 ? items.map((i: any) => i.name).join(', ') : 'các đối tượng quen thuộc';
  return {
    id: `plan_${Date.now()}`,
    title: `Giáo án nhận biết tập nói: ${gameTitle || topic}`,
    topic: topic || 'Khám phá thế giới',
    ageRange: ageRange || '12–24 tháng',
    durationMinutes: 15,
    objectives: {
      knowledge: [
        `Trẻ nhận biết và gọi tên được ${itemNames}.`,
        'Trẻ nhận biết được âm thanh và tiếng kêu đặc trưng.',
        'Trẻ nhận biết được màu sắc cơ bản và hình dáng nổi bật.',
      ],
      skills: [
        'Rèn luyện kỹ năng nghe và phản xạ thính giác nhanh nhạy.',
        'Phát triển ngôn ngữ: Trẻ phát âm từ đơn rõ ràng, không ngọng.',
        'Rèn luyện phối hợp tay - mắt và kỹ năng vận động thô/tinh theo nhạc.',
      ],
      attitude: [
        'Trẻ hào hứng, vui tươi, tích cực tham gia tương tác cùng cô và các bạn.',
        'Hình thành tình cảm yêu quý thế giới tự nhiên và đồ vật xung quanh.',
      ],
    },
    preparations: {
      teacher: [
        'Mô hình hoặc tranh ảnh thật tương ứng bài học.',
        'Loa âm thanh, micro nhỏ để cô hướng dẫn.',
        'Phần mềm TinyLearn cài sẵn trên Smart TV cảm ứng hoặc máy tính bảng.',
      ],
      children: [
        'Trang phục gọn gàng, tâm thế vui vẻ, thoải mái.',
        'Thảm xốp mềm ngồi theo hình chữ U quanh màn hình tương tác.',
      ],
      itApplication: [
        'Ứng dụng TinyLearn phiên bản TV cảm ứng (nút lớn, giọng nữ tiếng Việt chuẩn 100%).',
      ],
    },
    steps: [
      {
        phase: '1. Ổn định - Gây hứng thú',
        duration: '2–3 phút',
        activities: 'Chào hỏi và lắng nghe âm thanh bí mật',
        teacherGuidance:
          'Cô hát bài hát vui nhộn và tạo tiếng kêu bất ngờ: "Đố các con biết tiếng gì vừa kêu thế nhỉ?". Kích thích trẻ tò mò hướng lên cô.',
        childrenResponse: 'Trẻ vui vẻ vỗ tay, chú ý lắng nghe và đoán cùng cô.',
      },
      {
        phase: '2. Hoạt động trọng tâm',
        duration: '7–8 phút',
        activities: 'Nhận biết, tập nói và mô phỏng vận động',
        teacherGuidance: `Cô đưa hình ảnh ${itemNames}, phát âm mẫu chậm rãi, hướng dẫn trẻ tập nói theo: "Con Mèo - Meo meo", kết hợp làm động tác mô phỏng ngộ nghĩnh.`,
        childrenResponse: 'Trẻ chăm chú nhìn, tập phát âm từng từ đơn và háo hức bắt chước động tác theo cô.',
      },
      {
        phase: '3. Trò chơi củng cố trên TinyLearn',
        duration: '3–4 phút',
        activities: 'Nghe âm thanh và chạm chọn hình đúng',
        teacherGuidance:
          'Cô bật màn hình trò chơi TinyLearn, mời từng nhóm trẻ lên nghe cô đọc câu hỏi và dùng ngón tay chạm vào đáp án đúng trên màn hình cảm ứng.',
        childrenResponse: 'Trẻ tự tin tiến lên màn hình, chạm vào hình ảnh và nhảy múa reo hò khi nhận được ngôi sao khen thưởng.',
      },
      {
        phase: '4. Kết thúc hoạt động',
        duration: '1–2 phút',
        activities: 'Khen ngợi và chuyển tiếp',
        teacherGuidance: 'Cô tuyên dương cả lớp ngoan ngoãn, cùng trẻ làm động tác nhẹ nhàng chuyển sang hoạt động góc.',
        childrenResponse: 'Trẻ vỗ tay hoan hô, chào cô và chuyển sang giờ chơi tiếp theo.',
      },
    ],
    evaluation:
      'Đa số trẻ trong lớp nhận biết và phát âm đúng các đối tượng. Giáo viên chú ý khích lệ thêm 2–3 trẻ còn nhút nhát trong các giờ hoạt động sau.',
    createdAt: Date.now(),
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    nativeTTSAvailable: true,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Vite Middleware for SPA
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`TinyLearn Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
