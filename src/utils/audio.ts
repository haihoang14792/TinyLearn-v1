/**
 * ====================================================================
 * ENHANCED AUDIO & SPEECH ENGINE FOR TINYLEARN
 * ====================================================================
 * Integrated with dedicated speechService and audioManager.
 * 
 * CORE PEDAGOGY & SAFETY PRINCIPLES:
 * 1. 100% Vietnamese Female Voice priority.
 * 2. Never falls back to English/foreign voice for Vietnamese sentences.
 * 3. Never truncates, normalizes away, or ruins Vietnamese accents.
 * 4. Cancels prior playback immediately to prevent overlapping audio.
 * 5. Gentle, toddler-tuned speech speed (default 0.85) and natural pitch (1.05).
 * 6. 3-Tier playback priority:
 *    - Tier 1: Recorded Vietnamese audio file (MP3/data URL).
 *    - Tier 2: Backend authentic Vietnamese teacher TTS (/api/tts).
 *    - Tier 3: Browser Web Speech API (speechService).
 */

import {
  audioManager,
  loadVoices,
  getVietnameseVoices,
  getBestVietnameseVoice,
  hasVietnameseVoice,
  isSpeechSupported,
  normalizeTextForSpeech,
  stopSpeaking,
  speakVietnamese as baseSpeakVietnamese,
} from '../services/audioManager.ts';

import {
  getPreferredVoiceName,
  setPreferredVoiceName,
  getPreferredSpeechRate,
  setPreferredSpeechRate,
} from '../services/speechService.ts';

import {
  buildToddlerQuestionSSML,
  buildToddlerPraiseSSML,
  buildToddlerEncouragementSSML,
  parseSSMLToSegments,
  isSSML,
  stripSSML,
} from './ssml.ts';

export interface AvailableVoice {
  name: string;
  lang: string;
  voiceURI: string;
  isVietnamese: boolean;
  qualityBadge: string;
  nativeVoice: SpeechSynthesisVoice;
}

export interface VietnameseFemaleVoiceOption {
  name: string;
  displayName: string;
  voiceURI: string;
  lang: string;
  provider: string;
  qualityRating: string;
  isRecommended: boolean;
  nativeVoice: SpeechSynthesisVoice;
}

// Female voice name identifiers for scoring
const FEMALE_VOICE_NAMES = [
  'female',
  'woman',
  'hoaimy',
  'hoai my',
  'vietnamese female',
  'linh',
  'mai',
  'chi',
  'thu',
  'ngoc',
  'ngọc',
  'lan',
  'hương',
  'huong',
  'google tiếng việt',
  'natural',
];

const MALE_VOICE_NAMES = [
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

export function isMaleVoice(name: string): boolean {
  const n = (name || '').toLowerCase();
  const withoutCountry = n.replace(/vietnam(ese)?/g, '').replace(/tiếng việt/g, '');
  return MALE_VOICE_NAMES.some((kw) => withoutCountry.includes(kw));
}

class AudioEngine {
  private voiceMode: 'ai_preferred' | 'browser_only' = 'ai_preferred';
  private enableSSML = true;
  private ssmlBreakDurationMs = 450;
  private isSequenceCancelled = false;
  private activeChainTimer: ReturnType<typeof setTimeout> | null = null;
  private preferredVoiceURI: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      loadVoices().catch(() => {});
    }
  }

  /**
   * Stops all active audio elements and speech synthesis.
   */
  public stopAll(): void {
    if (this.activeChainTimer) {
      clearTimeout(this.activeChainTimer);
      this.activeChainTimer = null;
    }
    this.isSequenceCancelled = true;
    audioManager.stopAll();
  }

  /**
   * Set speech synthesis mode: server AI preferred vs browser offline only
   */
  public setVoiceMode(mode: 'ai_preferred' | 'browser_only'): void {
    this.voiceMode = mode;
  }

  public getIsAIFallbackActive(): boolean {
    return false;
  }

  public setSSMLConfig(enabled: boolean, breakDurationMs?: number): void {
    this.enableSSML = enabled;
    if (breakDurationMs !== undefined) {
      this.ssmlBreakDurationMs = breakDurationMs;
    }
  }

  public setPreferredVoice(voiceURIOrName: string): void {
    this.preferredVoiceURI = voiceURIOrName;
    setPreferredVoiceName(voiceURIOrName);
  }

  /**
   * Retrieves all available voices, prioritizing Vietnamese voices
   */
  public getAvailableVoices(): AvailableVoice[] {
    if (typeof window === 'undefined' || !isSpeechSupported()) return [];

    const voices = window.speechSynthesis.getVoices() || [];
    return voices
      .filter((v) => !isMaleVoice(v.name))
      .map((v) => {
        const lang = (v.lang || '').toLowerCase().replace(/_/g, '-');
        const name = (v.name || '').toLowerCase();
        const isVi =
          lang.startsWith('vi') ||
          name.includes('tiếng việt') ||
          name.includes('vietnamese') ||
          name.includes('vietnam');

        let qualityBadge = 'Giọng Nữ Cơ Bản';
        if (name.includes('google') && isVi) qualityBadge = 'Google Nữ Chuẩn ★★★★★';
        else if (name.includes('hoaimy') || name.includes('hoài my')) qualityBadge = 'Microsoft Hoài My Nữ ★★★★★';
        else if (name.includes('linh')) qualityBadge = 'Apple Linh Nữ ★★★★★';
        else if (isVi) qualityBadge = 'Giọng Nữ Tiếng Việt';

        return {
          name: v.name,
          lang: v.lang,
          voiceURI: v.voiceURI,
          isVietnamese: isVi,
          qualityBadge,
          nativeVoice: v,
        };
      });
  }

  /**
   * Returns list of verified Vietnamese female voices
   */
  public getHighQualityVietnameseFemaleVoices(): VietnameseFemaleVoiceOption[] {
    const viVoices = getVietnameseVoices();

    const mapped: VietnameseFemaleVoiceOption[] = viVoices
      .filter((v) => !isMaleVoice(v.name))
      .map((v) => {
        const n = v.name.toLowerCase();
        let provider = 'Hệ thống thiết bị';
        let displayName = v.name;
        let qualityRating = '★★★★☆ Tốt';
        let isRecommended = false;

        if (n.includes('google')) {
          provider = 'Google Chrome / Android';
          displayName = 'Google Tiếng Việt (Nữ tự nhiên)';
          qualityRating = '★★★★★ Chuẩn mầm non';
          isRecommended = true;
        } else if (n.includes('hoaimy') || n.includes('hoài my')) {
          provider = 'Microsoft Edge / Windows';
          displayName = 'Microsoft Hoài My (Nữ chuẩn)';
          qualityRating = '★★★★★ Rất truyền cảm';
          isRecommended = true;
        } else if (n.includes('linh')) {
          provider = 'Apple iOS / Mac';
          displayName = 'Apple Linh (Nữ dịu dàng)';
          qualityRating = '★★★★★ Trong trẻo, êm tai';
          isRecommended = true;
        } else if (n.includes('mai')) {
          provider = 'Apple / iOS';
          displayName = 'Apple Mai (Nữ miền Bắc)';
          qualityRating = '★★★★☆ Rất tốt';
        } else if (n.includes('thu')) {
          provider = 'Apple / iOS';
          displayName = 'Apple Thu (Nữ truyền cảm)';
          qualityRating = '★★★★☆ Rất tốt';
        }

        return {
          name: v.name,
          displayName,
          voiceURI: v.voiceURI,
          lang: v.lang,
          provider,
          qualityRating,
          isRecommended,
          nativeVoice: v,
        };
      });

    mapped.sort((a, b) => {
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      return a.displayName.localeCompare(b.displayName);
    });

    return mapped;
  }

  public getAvailableVietnameseFemaleVoices(): VietnameseFemaleVoiceOption[] {
    return this.getHighQualityVietnameseFemaleVoices();
  }

  /**
   * Plays an uploaded/recorded audio file URL.
   */
  public async playAudioUrl(url: string): Promise<boolean> {
    const audio = await audioManager.playAudio(url);
    return !!audio;
  }

  /**
   * Unified speech method:
   * Honors 3-tier priority, strips emojis/icons, preserves accents.
   */
  public async speakVietnamese(
    textOrSSML: string,
    options?: { pitch?: number; rate?: number; onEnd?: () => void }
  ): Promise<boolean> {
    if (!textOrSSML) {
      options?.onEnd?.();
      return false;
    }

    const clean = normalizeTextForSpeech(textOrSSML);
    if (!clean) {
      options?.onEnd?.();
      return false;
    }

    // Tier 1 & 2: If AI preferred, try server TTS / high quality cached audio
    if (this.voiceMode === 'ai_preferred') {
      try {
        await audioManager.playVoice(clean, undefined, {
          preferServerAudio: true,
          rate: options?.rate ?? getPreferredSpeechRate(),
          pitch: options?.pitch ?? 1.05,
          onEnd: options?.onEnd,
        });
        return true;
      } catch {
        // Fall through to browser
      }
    }

    // Tier 3: Client browser Web Speech API
    return this.speakBrowserVietnamese(clean, options);
  }

  /**
   * Browser SpeechSynthesis execution with verified female Vietnamese voice
   */
  public async speakBrowserVietnamese(
    textOrSSML: string,
    options?: { pitch?: number; rate?: number; onEnd?: () => void }
  ): Promise<boolean> {
    this.stopAll();
    this.isSequenceCancelled = false;

    // Handle SSML segments if markup is provided
    if (isSSML(textOrSSML)) {
      const segments = parseSSMLToSegments(textOrSSML, {
        rate: options?.rate ?? getPreferredSpeechRate(),
        pitch: options?.pitch ?? 1.05,
      });

      for (let i = 0; i < segments.length; i++) {
        if (this.isSequenceCancelled) return false;
        const seg = segments[i];

        if (seg.type === 'break') {
          const pauseTime = seg.durationMs ?? this.ssmlBreakDurationMs;
          await new Promise<void>((resolve) => {
            this.activeChainTimer = setTimeout(() => {
              this.activeChainTimer = null;
              resolve();
            }, pauseTime);
          });
        } else if (seg.type === 'speech' && seg.text) {
          const textToSpeak = seg.text;
          await new Promise<void>((resolve) => {
            baseSpeakVietnamese(textToSpeak, {
              rate: seg.rate ?? options?.rate ?? getPreferredSpeechRate(),
              pitch: seg.pitch ?? options?.pitch ?? 1.05,
              onEnd: resolve,
              onError: resolve,
            });
          });
        }
      }

      if (!this.isSequenceCancelled) {
        options?.onEnd?.();
      }
      return true;
    }

    // Plain text speech
    const cleanText = normalizeTextForSpeech(textOrSSML);
    return new Promise((resolve) => {
      const ok = baseSpeakVietnamese(cleanText, {
        rate: options?.rate ?? getPreferredSpeechRate(),
        pitch: options?.pitch ?? 1.05,
        onEnd: () => {
          options?.onEnd?.();
          resolve(true);
        },
        onError: () => {
          options?.onEnd?.();
          resolve(false);
        },
      });
      if (!ok) resolve(false);
    });
  }

  /**
   * Alias for speakVietnamese
   */
  public async speak(
    textOrSSML: string,
    options?: { pitch?: number; rate?: number; onEnd?: () => void }
  ): Promise<boolean> {
    return this.speakVietnamese(textOrSSML, options);
  }

  /**
   * Play question prompt with priority:
   * 1. customAudioUrl (if provided)
   * 2. Toddler enriched speech
   */
  public async playQuestion(
    questionText: string,
    customAudioUrl?: string,
    options?: { targetName?: string; onEnd?: () => void }
  ): Promise<void> {
    if (customAudioUrl && customAudioUrl.length > 5) {
      await this.playAudioUrl(customAudioUrl);
      options?.onEnd?.();
      return;
    }

    let payload = questionText;
    if (this.enableSSML && !isSSML(questionText)) {
      payload = buildToddlerQuestionSSML(questionText, {
        breakDurationMs: this.ssmlBreakDurationMs,
        targetName: options?.targetName,
      });
    }

    await this.speakVietnamese(payload, { onEnd: options?.onEnd });
  }

  /**
   * Play praise with child-friendly chime and words
   */
  public async playPraise(customAudioUrl?: string, onEnd?: () => void): Promise<void> {
    this.playSuccessChime();

    setTimeout(async () => {
      if (customAudioUrl && customAudioUrl.length > 5) {
        await this.playAudioUrl(customAudioUrl);
        onEnd?.();
        return;
      }

      const praises = [
        'Giỏi quá! Bé giỏi quá!',
        'Hoan hô con! Đúng rồi!',
        'Bé thông minh lắm!',
      ];
      const randomPraise = praises[Math.floor(Math.random() * praises.length)];
      await this.speakVietnamese(randomPraise, { rate: 0.88, pitch: 1.05, onEnd });
    }, 280);
  }

  /**
   * Play gentle encouragement
   */
  public async playEncouragement(onEnd?: () => void): Promise<void> {
    this.playTryAgainChime();
    setTimeout(async () => {
      await this.speakVietnamese('Con thử lại nhé!', { rate: 0.85, pitch: 1.05, onEnd });
    }, 220);
  }

  // Sound effects
  public playSuccessChime(): void {
    audioManager.playSuccessChime();
  }

  public playTryAgainChime(): void {
    audioManager.playSoftThud();
  }

  public playSoftThud(): void {
    audioManager.playSoftThud();
  }

  public playPop(): void {
    audioManager.playPop();
  }

  public playRewardChime(): void {
    audioManager.playSuccessChime();
  }

  public playClappingApplause(): void {
    audioManager.playFanfare();
  }

  public playFanfare(): void {
    audioManager.playFanfare();
  }

  public playCheer(): void {
    audioManager.playFanfare();
  }
}

export const audioEngine = new AudioEngine();
