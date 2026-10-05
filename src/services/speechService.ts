/**
 * ====================================================================
 * TINYLEARN SPEECH SERVICE
 * ====================================================================
 * Dedicated, robust Web Speech API synthesizer for preschool toddlers (12–24 months).
 * 
 * CORE RULES:
 * 1. Strictly prioritize authentic Vietnamese FEMALE voice (vi-VN).
 * 2. Never pick voices[0] blindly.
 * 3. Never switch to an English/foreign voice to read Vietnamese.
 * 4. Proper voiceschanged listener for Chrome, Edge, Safari, Android.
 * 5. Sanitize text (strip emojis, UI icons, tags) while 100% preserving Vietnamese accents.
 * 6. Cancel previous speech before any new speech.
 * 7. Toddler-tuned pace: rate 0.85, pitch 1.05.
 * 8. Persist preferred voice in localStorage ('tinyLearnPreferredVoice').
 */

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

// Preferred female Vietnamese voice keywords (case-insensitive)
const VIETNAMESE_FEMALE_KEYWORDS = [
  'female',
  'woman',
  'hoaimy',
  'hoai my',
  'vietnamese female',
  'linh',
  'mai',
  'chi',
  'hương',
  'huong',
  'ngọc',
  'ngoc',
  'lan',
  'google tiếng việt',
  'natural',
];

// Male voice keywords to strictly avoid
const MALE_KEYWORDS = [
  'male',
  'namminh',
  'nam minh',
  'anh nam',
  'david',
  'george',
  'mark',
  'guy',
  'boy',
  'daniel',
];

let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoadedPromise: Promise<SpeechSynthesisVoice[]> | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Strips emojis, UI icons, buttons, HTML/SSML tags, and excess whitespace.
 * CRITICAL: PRESERVES 100% OF VIETNAMESE DIACRITICS / ACCENTS.
 * (Does NOT remove tone marks, "Quả chuối" stays "Quả chuối").
 */
export function normalizeTextForSpeech(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Remove HTML/SSML tags: <break time="..."/>, <span>, etc.
  text = text.replace(/<[^>]*>/g, ' ');

  // 2. Remove emojis and diverse pictographs using standard unicode ranges
  // Matches Emoticons, Miscellaneous Symbols, Dingbats, Transport & Map, Supplemental Symbols
  text = text.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu,
    ''
  );

  // 3. Remove common UI symbols: 🔊, 🔈, 🎧, ⭐, 🎉, 🌟, 🍼, 👶, ➡, ➕, 🗑, 🚀, ✓, ✅, ○, ❌, etc.
  text = text.replace(/[🔊🔈🔉📢🎧⭐🎉🌟🍼👶➡➜➔➕🗑🚀✓✔✅○●❌✕✖⚙️🧪]/g, '');

  // 4. Remove standalone bracketed labels like [Hình 1], (Nghe lại), etc.
  text = text.replace(/\[[^\]]*\]/g, '');

  // 5. Normalize multiple whitespace and trim
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Checks if the browser supports SpeechSynthesis.
 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Asynchronously loads and waits for available voices from the browser.
 * Handles Chrome / Edge / Android / Safari asynchronous voice initialization.
 */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSupported()) {
    return Promise.resolve([]);
  }

  if (cachedVoices.length > 0) {
    return Promise.resolve(cachedVoices);
  }

  if (voicesLoadedPromise) {
    return voicesLoadedPromise;
  }

  voicesLoadedPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const synth = window.speechSynthesis;

    const checkAndResolve = () => {
      const available = synth.getVoices() || [];
      if (available.length > 0) {
        cachedVoices = available;

        // Debug output for development environment
        if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
          try {
            console.log('[TinyLearn Speech] Voices loaded. Total:', available.length);
            const viVoices = getVietnameseVoices();
            if (viVoices.length > 0) {
              console.table(
                viVoices.map((v) => ({
                  name: v.name,
                  lang: v.lang,
                  localService: v.localService,
                  default: v.default,
                }))
              );
            } else {
              console.warn('[TinyLearn Speech] No native Vietnamese voice found on this device.');
            }
          } catch {
            // Ignore console formatting errors
          }
        }

        resolve(cachedVoices);
        return true;
      }
      return false;
    };

    // Immediate check
    if (checkAndResolve()) return;

    // Listen for voiceschanged event
    const onVoicesChanged = () => {
      if (checkAndResolve()) {
        synth.removeEventListener('voiceschanged', onVoicesChanged);
      }
    };

    synth.addEventListener('voiceschanged', onVoicesChanged);
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = onVoicesChanged;
    }

    // Safety timeout polling for browsers that don't fire voiceschanged promptly
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (checkAndResolve() || attempts >= 10) {
        clearInterval(interval);
        synth.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(synth.getVoices() || []);
      }
    }, 250);
  });

  return voicesLoadedPromise;
}

/**
 * Returns all detected Vietnamese voices.
 */
export function getVietnameseVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];

  const synth = window.speechSynthesis;
  const list = cachedVoices.length > 0 ? cachedVoices : synth.getVoices() || [];

  return list.filter((v) => {
    const lang = (v.lang || '').toLowerCase().replace(/_/g, '-');
    const name = (v.name || '').toLowerCase();

    // 1. Explicit Vietnamese language code
    if (lang === 'vi-vn' || lang.startsWith('vi-') || lang === 'vi') {
      return true;
    }

    // 2. Name explicitly contains Vietnamese / Tiếng Việt
    if (name.includes('vietnam') || name.includes('tiếng việt') || name.includes('tieng viet')) {
      return true;
    }

    return false;
  });
}

/**
 * Checks if the device has at least one Vietnamese voice available.
 */
export function hasVietnameseVoice(): boolean {
  return getVietnameseVoices().length > 0;
}

/**
 * Strictly finds and selects the best natural Vietnamese FEMALE voice.
 * Priority hierarchy:
 * 1. Teacher's saved preferred voice in localStorage (if still available).
 * 2. Voice with lang === "vi-VN" and a female name identifier (HoaiMy, Linh, Female, etc.).
 * 3. Any voice with lang === "vi-VN" that is not male.
 * 4. Any voice with lang starting with "vi".
 * 5. Any voice containing "vietnamese" or "tiếng việt" in its name.
 * 
 * NEVER returns an English or non-Vietnamese voice! If none found, returns null.
 */
export function getBestVietnameseVoice(): SpeechSynthesisVoice | null {
  const viVoices = getVietnameseVoices();

  if (viVoices.length === 0) {
    return null;
  }

  // 1. Check if user configured a preferred voice in localStorage
  const savedName = getPreferredVoiceName();
  if (savedName) {
    const matched = viVoices.find((v) => v.name === savedName || v.voiceURI === savedName);
    if (matched) return matched;
  }

  // Helper to score voices
  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    let score = 0;
    const nameLower = (v.name || '').toLowerCase();
    const langLower = (v.lang || '').toLowerCase().replace(/_/g, '-');

    // Language score
    if (langLower === 'vi-vn') score += 50;
    else if (langLower.startsWith('vi')) score += 30;

    // Deduct male keywords
    const isMale = MALE_KEYWORDS.some((kw) => nameLower.includes(kw));
    if (isMale) score -= 100;

    // Female keywords bonus
    const isFemale = VIETNAMESE_FEMALE_KEYWORDS.some((kw) => nameLower.includes(kw));
    if (isFemale) score += 60;

    // Cloud / High quality voices bonus (Google, Microsoft, Apple, Natural)
    if (nameLower.includes('natural') || nameLower.includes('online')) score += 20;
    if (nameLower.includes('google')) score += 25;
    if (nameLower.includes('hoaimy') || nameLower.includes('hoai my')) score += 30;
    if (nameLower.includes('linh')) score += 25;

    return score;
  };

  const sorted = [...viVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a));

  return sorted[0] || null;
}

/**
 * Gets saved preferred voice name from localStorage.
 */
export function getPreferredVoiceName(): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem('tinyLearnPreferredVoice');
    }
  } catch {
    // Ignore storage restrictions
  }
  return null;
}

/**
 * Saves preferred voice name to localStorage.
 */
export function setPreferredVoiceName(voiceName: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('tinyLearnPreferredVoice', voiceName);
    }
  } catch {
    // Ignore storage restrictions
  }
}

/**
 * Gets preferred speech rate (default: 0.85).
 */
export function getPreferredSpeechRate(): number {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('tinyLearnSpeechRate');
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 0.7 && val <= 1.2) {
          return val;
        }
      }
    }
  } catch {
    // Ignore storage restrictions
  }
  return 0.85; // Standard preschool rate
}

/**
 * Saves preferred speech rate to localStorage.
 */
export function setPreferredSpeechRate(rate: number): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('tinyLearnSpeechRate', rate.toString());
    }
  } catch {
    // Ignore storage restrictions
  }
}

/**
 * Immediately stops any active browser speech synthesis.
 */
export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;

  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }

  currentUtterance = null;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore
  }
}

/**
 * Speaks authentic Vietnamese text using the best natural female voice.
 * Configured specifically for toddlers:
 * - rate: 0.85 (clear, gentle, not too fast, not robotic)
 * - pitch: 1.05 (natural human pitch, never 1.8 or 2)
 * - lang: "vi-VN"
 * - Cancels old speech before speaking.
 */
export function speakVietnamese(rawText: string, options: SpeakOptions = {}): boolean {
  if (!isSpeechSupported()) {
    options.onError?.(new Error('Trình duyệt không hỗ trợ Web Speech API.'));
    return false;
  }

  const text = normalizeTextForSpeech(rawText);
  if (!text) {
    return false;
  }

  // 1. Cancel any active speech first (Avoid queuing and overlapping)
  stopSpeaking();

  const synth = window.speechSynthesis;
  const bestVoice = getBestVietnameseVoice();

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang || 'vi-VN';
    } else {
      // Find any Vietnamese voice in list
      const anyViVoice = getVietnameseVoices()[0];
      if (anyViVoice) {
        utterance.voice = anyViVoice;
        utterance.lang = anyViVoice.lang || 'vi-VN';
      } else {
        // Fallback: don't block speech if getVoices() is empty or hasn't loaded!
        // Setting lang to 'vi-VN' allows Chrome/Edge/Safari/Android to synthesize via OS/Network TTS
        utterance.lang = 'vi-VN';
      }
    }

    // Rate: user preference or 0.85
    const targetRate = options.rate !== undefined ? options.rate : getPreferredSpeechRate();
    utterance.rate = Math.max(0.75, Math.min(targetRate, 1.1));

    // Pitch: natural gentle tone (1.05), never artificial robot pitch
    const targetPitch = options.pitch !== undefined ? options.pitch : 1.05;
    utterance.pitch = Math.max(0.95, Math.min(targetPitch, 1.2));

    utterance.volume = options.volume !== undefined ? options.volume : 1;

    currentUtterance = utterance;

    utterance.onstart = () => {
      options.onStart?.();

      // Chrome long-speech pause bug workaround: keep synthesis active
      if (keepAliveTimer) clearInterval(keepAliveTimer);
      keepAliveTimer = setInterval(() => {
        if (!synth.speaking) {
          clearInterval(keepAliveTimer!);
          keepAliveTimer = null;
        } else {
          synth.pause();
          synth.resume();
        }
      }, 5000);
    };

    utterance.onend = () => {
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
      currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (event) => {
      if (keepAliveTimer) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
      currentUtterance = null;

      // Ignore canceled errors as they are triggered intentionally by stopSpeaking()
      if (event.error === 'canceled' || event.error === 'interrupted') {
        return;
      }
      console.warn('[TinyLearn Speech] Speech utterance error:', event.error);
      options.onError?.(event);
    };

    synth.speak(utterance);
    return true;
  } catch (err) {
    console.warn('[TinyLearn Speech] Speech dispatch exception:', err);
    options.onError?.(err);
    return false;
  }
}

/**
 * Primes and unlocks Web Speech API on iOS Safari / Android Chrome during a user gesture.
 */
export function unlockSpeechSynthesis(): void {
  if (!isSpeechSupported()) return;
  try {
    const silent = new SpeechSynthesisUtterance(' ');
    silent.volume = 0.01;
    silent.rate = 2;
    window.speechSynthesis.speak(silent);
  } catch {
    // Ignore unlock errors
  }
}

// Auto initialize on module load
if (typeof window !== 'undefined') {
  loadVoices().catch(() => {});
}
