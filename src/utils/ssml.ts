/**
 * Speech Synthesis Markup Language (SSML) Engine for TinyLearn
 * Specially calibrated for toddlers (12–24 months) in Vietnamese.
 * Features:
 * - Natural preschool teacher pauses between question & instruction (<break time="450ms"/>)
 * - Calibrated slower pacing for baby ear phonetics (<prosody rate="85%">)
 * - Cheerful melodic pitch contour (<prosody pitch="+5%">)
 * - Phonetic emphasis on onomatopoeia sounds & object names (<emphasis level="strong">)
 * - Browser Virtual SSML Executor (sequential multi-utterance with timer breaks)
 */

export interface SSMLSegment {
  type: 'speech' | 'break';
  text?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  durationMs?: number;
  emphasis?: boolean;
}

/**
 * Remove all XML/SSML tags to get plain clean text
 */
export function stripSSML(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if a string contains SSML tags
 */
export function isSSML(input: string): boolean {
  return /<speak|<break|<prosody|<emphasis/i.test(input);
}

/**
 * Auto-enrich standard preschool questions into warm, natural SSML for 12-24m babies
 * Example: "Con gì kêu meo meo? Tìm bạn Mèo nào!"
 * =>
 * <speak version="1.0" xml:lang="vi-VN">
 *   <prosody rate="86%" pitch="+3%">
 *     <emphasis level="moderate">Con gì kêu meo meo?</emphasis>
 *     <break time="450ms"/>
 *     Tìm bạn <emphasis level="strong">Mèo</emphasis> nào!
 *   </prosody>
 * </speak>
 */
export function buildToddlerQuestionSSML(
  questionText: string,
  options?: {
    breakDurationMs?: number;
    baseRate?: number;
    basePitch?: number;
    targetName?: string;
  }
): string {
  const clean = stripSSML(questionText);
  const breakMs = options?.breakDurationMs ?? 450;
  const ratePct = Math.round((options?.baseRate ?? 0.88) * 100);
  const pitchPct = Math.round(((options?.basePitch ?? 1.0) - 1.0) * 100);
  const pitchStr = pitchPct >= 0 ? `+${pitchPct}%` : `${pitchPct}%`;

  // Split into question and instruction if contains '?' or '.'
  let part1 = clean;
  let part2 = '';

  const qMarkIndex = clean.indexOf('?');
  if (qMarkIndex !== -1 && qMarkIndex < clean.length - 1) {
    part1 = clean.substring(0, qMarkIndex + 1).trim();
    part2 = clean.substring(qMarkIndex + 1).trim();
  } else {
    const dotIndex = clean.indexOf('.');
    if (dotIndex !== -1 && dotIndex < clean.length - 1) {
      part1 = clean.substring(0, dotIndex + 1).trim();
      part2 = clean.substring(dotIndex + 1).trim();
    }
  }

  // Highlight target name if present in part2
  let formattedPart2 = part2;
  if (options?.targetName && part2.includes(options.targetName)) {
    formattedPart2 = part2.replace(
      options.targetName,
      `<emphasis level="strong">${options.targetName}</emphasis>`
    );
  }

  if (part2) {
    return `<speak version="1.0" xml:lang="vi-VN">
  <prosody rate="${ratePct}%" pitch="${pitchStr}">
    <emphasis level="moderate">${part1}</emphasis>
    <break time="${breakMs}ms"/>
    ${formattedPart2}
  </prosody>
</speak>`;
  }

  return `<speak version="1.0" xml:lang="vi-VN">
  <prosody rate="${ratePct}%" pitch="${pitchStr}">
    ${clean}
  </prosody>
</speak>`;
}

/**
 * Build SSML for praise ("Giỏi quá! Bé giỏi quá!")
 */
export function buildToddlerPraiseSSML(praiseText: string): string {
  const clean = stripSSML(praiseText);
  return `<speak version="1.0" xml:lang="vi-VN">
  <prosody rate="90%" pitch="+8%">
    <emphasis level="strong">${clean}</emphasis>
    <break time="250ms"/>
    <prosody pitch="+5%">Hoan hô bé ngoan!</prosody>
  </prosody>
</speak>`;
}

/**
 * Build SSML for gentle encouragement ("Con thử lại nhé!")
 */
export function buildToddlerEncouragementSSML(text: string): string {
  const clean = stripSSML(text);
  return `<speak version="1.0" xml:lang="vi-VN">
  <prosody rate="84%" pitch="-2%">
    ${clean}
    <break time="350ms"/>
    <prosody rate="88%" pitch="+2%">Bé yêu nhìn lại xem nào!</prosody>
  </prosody>
</speak>`;
}

/**
 * Parse an SSML string into sequential execution segments for browser Web Speech API.
 * This guarantees real pauses and prosody adjustments on any browser without pronouncing XML tags.
 */
export function parseSSMLToSegments(
  ssmlInput: string,
  defaults?: { rate?: number; pitch?: number }
): SSMLSegment[] {
  const baseRate = defaults?.rate ?? 0.88;
  const basePitch = defaults?.pitch ?? 1.0;

  if (!isSSML(ssmlInput)) {
    return [
      {
        type: 'speech',
        text: ssmlInput.trim(),
        rate: baseRate,
        pitch: basePitch,
      },
    ];
  }

  const segments: SSMLSegment[] = [];

  // Match tags and text
  // Tokenizer pattern: <break .../> OR <tag ...> OR </tag> OR text
  const tagRegex = /(<break\s+[^>]*\/?>|<[^>]+>|[^<]+)/gi;
  const matches = ssmlInput.match(tagRegex) || [];

  let currentRate = baseRate;
  let currentPitch = basePitch;
  let inEmphasis = false;

  for (const token of matches) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    // Check if it's a <break ...>
    if (/^<break\s+/i.test(trimmed)) {
      let durationMs = 400; // default pause
      const timeMatch = trimmed.match(/time=["'](\d+)(ms|s)?["']/i);
      if (timeMatch) {
        const val = parseInt(timeMatch[1], 10);
        const unit = timeMatch[2]?.toLowerCase() || 'ms';
        durationMs = unit === 's' ? val * 1000 : val;
      } else {
        const strengthMatch = trimmed.match(/strength=["'](none|x-weak|weak|medium|strong|x-strong)["']/i);
        if (strengthMatch) {
          switch (strengthMatch[1].toLowerCase()) {
            case 'weak': durationMs = 250; break;
            case 'medium': durationMs = 450; break;
            case 'strong': durationMs = 700; break;
            case 'x-strong': durationMs = 1000; break;
            default: durationMs = 350;
          }
        }
      }
      segments.push({ type: 'break', durationMs });
      continue;
    }

    // Check <prosody ...>
    if (/^<prosody\s+/i.test(trimmed)) {
      const rateMatch = trimmed.match(/rate=["'](\d+)%["']/i);
      if (rateMatch) {
        currentRate = baseRate * (parseInt(rateMatch[1], 10) / 100);
      }
      const pitchMatch = trimmed.match(/pitch=["']([+-]?\d+)%["']/i);
      if (pitchMatch) {
        const delta = parseInt(pitchMatch[1], 10) / 100;
        currentPitch = Math.max(0.5, Math.min(2.0, basePitch + delta));
      }
      continue;
    }

    // Check </prosody>
    if (/^<\/prosody>/i.test(trimmed)) {
      currentRate = baseRate;
      currentPitch = basePitch;
      continue;
    }

    // Check <emphasis>
    if (/^<emphasis/i.test(trimmed)) {
      inEmphasis = true;
      continue;
    }
    if (/^<\/emphasis>/i.test(trimmed)) {
      inEmphasis = false;
      continue;
    }

    // Ignore other XML wrappers: <speak>, </speak>, <voice>, </voice>
    if (/^<\/?(speak|voice|say-as)/i.test(trimmed)) {
      continue;
    }

    // It's speech text!
    const cleanText = trimmed.replace(/\s+/g, ' ');
    if (cleanText) {
      segments.push({
        type: 'speech',
        text: cleanText,
        rate: inEmphasis ? Math.max(0.75, currentRate * 0.95) : currentRate,
        pitch: inEmphasis ? Math.min(1.5, currentPitch + 0.08) : currentPitch,
        emphasis: inEmphasis,
      });
    }
  }

  return segments;
}
