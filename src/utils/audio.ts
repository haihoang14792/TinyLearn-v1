/**
 * Enhanced Audio & Vietnamese Speech Engine for TinyLearn
 * Dual-engine: High Quality AI Vietnamese Preschool Teacher (Server TTS) +
 * Smart Ranked Browser Speech Synthesis (Google Tiếng Việt / Microsoft HoaiMy / Apple Linh)
 * + Full SSML (Speech Synthesis Markup Language) Support for natural toddler pauses & cadence
 * + Web Audio Glockenspiel / Friendly Toddler Sound Effects
 */

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

/**
 * Detect male voices to strictly filter them out, avoiding unnatural, robotic or foreign-accented voices
 */
export function isMaleVoice(name: string): boolean {
  const n = (name || '').toLowerCase();
  // Strip out "vietnam" and "vietnamese" so the word "nam" in "vietnam" is not falsely triggered
  const withoutCountry = n.replace(/vietnam(ese)?/g, '').replace(/tiếng việt/g, '');

  return (
    withoutCountry.includes('namminh') ||
    withoutCountry.includes('nam minh') ||
    /\bnam\b/.test(withoutCountry) ||
    withoutCountry.includes('male') ||
    withoutCountry.includes('anh nam') ||
    withoutCountry.includes('david') ||
    withoutCountry.includes('george') ||
    withoutCountry.includes('mark') ||
    withoutCountry.includes('richard') ||
    withoutCountry.includes('james') ||
    withoutCountry.includes('puck') ||
    withoutCountry.includes('fenrir') ||
    withoutCountry.includes('charon') ||
    withoutCountry.includes('guy') ||
    withoutCountry.includes('boy') ||
    withoutCountry.includes('daniel') ||
    withoutCountry.includes('alex') ||
    withoutCountry.includes('fred') ||
    withoutCountry.includes('bruce') ||
    withoutCountry.includes('junior')
  );
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private isSpeaking = false;
  private voices: SpeechSynthesisVoice[] = [];
  private ttsClientCache = new Map<string, string>();
  private bestVietnameseVoice: SpeechSynthesisVoice | null = null;
  private preferredVoiceURI: string = '';
  private voiceMode: 'ai_preferred' | 'browser_only' = 'ai_preferred';

  // SSML Configuration
  private enableSSML = true;
  private ssmlBreakDurationMs = 450;
  private activeChainTimer: ReturnType<typeof setTimeout> | null = null;
  private isSequenceCancelled = false;
  private isAIFallbackActive = false;
  private aiFallbackUntil = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVoices();
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const load = () => {
      try {
        this.voices = window.speechSynthesis.getVoices() || [];
        this.selectBestVietnameseVoice();
      } catch {
        // ignore
      }
    };

    load();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = load;
    }
    // Retry for Chrome/Safari async voice registration
    setTimeout(load, 500);
    setTimeout(load, 1500);
  }

  /**
   * Rank and pick the highest natural quality Vietnamese FEMALE voice
   * Strictly excludes any male or robotic voices
   */
  private selectBestVietnameseVoice() {
    if (!this.voices || this.voices.length === 0) return;

    if (this.preferredVoiceURI) {
      const userSelected = this.voices.find(
        (v) => v.voiceURI === this.preferredVoiceURI && !isMaleVoice(v.name)
      );
      if (userSelected) {
        this.bestVietnameseVoice = userSelected;
        return;
      }
    }

    // Filter strictly for Vietnamese voices and EXCLUDE all male voices
    const viFemaleVoices = this.voices.filter((v) => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      const n = (v.name || '').toLowerCase();
      const isVi =
        l.startsWith('vi') ||
        n.includes('tiếng việt') ||
        n.includes('vietnam') ||
        n.includes('vietnamese');

      if (!isVi) return false;
      // Strictly reject male voices
      if (isMaleVoice(v.name)) return false;

      return true;
    });

    if (viFemaleVoices.length > 0) {
      viFemaleVoices.sort((a, b) => {
        const score = (v: SpeechSynthesisVoice) => {
          const n = v.name.toLowerCase();
          // Highest natural female preschool voices
          if (n.includes('hoaimy') || n.includes('hoài my')) return 20; // Microsoft Hoài My (Nữ chuẩn)
          if (n.includes('google tiếng việt') || (n.includes('google') && v.lang.includes('vi'))) return 19; // Google Nữ Chuẩn
          if (n.includes('linh')) return 18; // Apple Linh (Nữ chuẩn)
          if (n.includes('mai') || n.includes('thu') || n.includes('ngoc') || n.includes('lan')) return 17; // Apple/Android Nữ
          if (n.includes('natural')) return 16;
          return 10;
        };

        return score(b) - score(a);
      });

      this.bestVietnameseVoice = viFemaleVoices[0];
      return;
    }

    // Fallback: If no Vietnamese female voice is installed, look for any female voice on system (NEVER male!)
    const allFemaleVoices = this.voices.filter((v) => !isMaleVoice(v.name));
    this.bestVietnameseVoice = allFemaleVoices.length > 0 ? allFemaleVoices[0] : null;
  }

  /**
   * Get list of installed FEMALE voices for Teacher Settings modal
   * Male voices are strictly filtered out to avoid foreign or distorted accents
   */
  getAvailableVoices(): AvailableVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices() || [];
    }

    // Strictly exclude male voices
    const femaleOnlyVoices = this.voices.filter((v) => !isMaleVoice(v.name));

    return femaleOnlyVoices.map((v) => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      const n = (v.name || '').toLowerCase();
      const isVi =
        l.startsWith('vi') ||
        n.includes('tiếng việt') ||
        n.includes('vietnam') ||
        n.includes('vietnamese');

      let badge = 'Giọng Nữ Cơ Bản';
      if (n.includes('google') && isVi) badge = 'Google Nữ Chuẩn ★★★★★';
      else if (n.includes('hoaimy') || (n.includes('natural') && isVi)) badge = 'Microsoft Hoài My Nữ ★★★★★';
      else if (n.includes('linh') || n.includes('thu') || n.includes('mai')) badge = 'Apple Linh/Thu Nữ ★★★★☆';
      else if (isVi) badge = 'Giọng Nữ Tiếng Việt';

      return {
        name: v.name,
        lang: v.lang,
        voiceURI: v.voiceURI,
        isVietnamese: isVi,
        qualityBadge: badge,
        nativeVoice: v,
      };
    });
  }

  /**
   * Get filtered dropdown list of ONLY high-quality Vietnamese female voices available in the browser
   */
  getHighQualityVietnameseFemaleVoices(): VietnameseFemaleVoiceOption[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices() || [];
    }

    const viFemaleVoices = this.voices.filter((v) => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      const n = (v.name || '').toLowerCase();
      const isVi =
        l.startsWith('vi') ||
        n.includes('tiếng việt') ||
        n.includes('vietnam') ||
        n.includes('vietnamese');

      if (!isVi) return false;
      if (isMaleVoice(v.name)) return false;
      return true;
    });

    const mapped: VietnameseFemaleVoiceOption[] = viFemaleVoices.map((v) => {
      const n = v.name.toLowerCase();
      let provider = 'Thiết bị';
      let displayName = v.name;
      let qualityRating = '★★★★☆ Tiêu chuẩn';
      let isRecommended = false;

      if (n.includes('google')) {
        provider = 'Google';
        displayName = 'Google Tiếng Việt (Nữ chuẩn Bắc Bộ)';
        qualityRating = '★★★★★ Chuẩn quốc gia';
        isRecommended = true;
      } else if (n.includes('hoaimy') || n.includes('hoài my')) {
        provider = 'Microsoft Natural';
        displayName = 'Microsoft Hoài My (Nữ tự nhiên mầm non)';
        qualityRating = '★★★★★ Ngọt ngào, truyền cảm';
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
      } else if (n.includes('ngoc') || n.includes('ngọc') || n.includes('lan') || n.includes('chi')) {
        provider = 'Hệ thống thiết bị';
        displayName = `${v.name} (Nữ tiếng Việt)`;
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

    // Sort recommended first, then alphabetically
    mapped.sort((a, b) => {
      if (a.isRecommended && !b.isRecommended) return -1;
      if (!a.isRecommended && b.isRecommended) return 1;
      return a.displayName.localeCompare(b.displayName);
    });

    return mapped;
  }

  setPreferredVoice(voiceURI: string) {
    this.preferredVoiceURI = voiceURI;
    this.selectBestVietnameseVoice();
  }

  setVoiceMode(mode: 'ai_preferred' | 'browser_only') {
    this.voiceMode = mode;
  }

  setSSMLConfig(enabled: boolean, breakDurationMs?: number) {
    this.enableSSML = enabled;
    if (breakDurationMs !== undefined) {
      this.ssmlBreakDurationMs = breakDurationMs;
    }
  }

  private getAudioContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Cheerful success chime (Glockenspiel / Marimba arpeggio)
   */
  playSuccessChime() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.48);
    });
  }

  /**
   * Subtle, gentle reward chime for toddler accomplishments (soft musical bell twinkle)
   */
  playRewardChime() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const notes = [659.25, 880.0, 1046.5]; // E5, A5, C6 (warm, sweet, gentle bells)
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine'; // pure, smooth, non-jarring tone for babies
      osc.frequency.setValueAtTime(freq, now + idx * 0.065);

      gain.gain.setValueAtTime(0, now + idx * 0.065);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.065 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.065);
      osc.stop(now + idx * 0.065 + 0.38);
    });
  }

  /**
   * Gentle, cheerful toddler applause (soft clapping hands sound effect)
   */
  playClappingApplause() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // 5 gentle claps in a joyful rhythm
    const clapTimes = [0, 0.12, 0.25, 0.38, 0.52];
    const now = ctx.currentTime;

    clapTimes.forEach((timeOffset) => {
      const bufferSize = Math.floor(ctx.sampleRate * 0.035); // 35ms soft burst
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.007));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1150, now + timeOffset);
      filter.Q.setValueAtTime(1.6, now + timeOffset);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.045);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now + timeOffset);
    });
  }

  /**
   * Gentle, soft "thử lại" tone (cute friendly boop, non-punishing for 12-24m toddlers)
   */
  playTryAgainChime() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(329.63, now);
    osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.22);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Tactile soft pop when toddler touches a card
   */
  playPop() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Stop any playing audio element, speech synthesis, or active SSML sequence
   */
  stopAll() {
    this.isSequenceCancelled = true;

    if (this.activeChainTimer) {
      clearTimeout(this.activeChainTimer);
      this.activeChainTimer = null;
    }

    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // ignore
      }
      this.currentAudioElement = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }

    this.isSpeaking = false;
  }

  /**
   * Play uploaded MP3/WAV/recorded audio URL
   */
  playAudioUrl(url: string): Promise<boolean> {
    this.stopAll();
    return new Promise((resolve) => {
      try {
        const audio = new Audio(url);
        this.currentAudioElement = audio;

        audio.onended = () => {
          this.currentAudioElement = null;
          resolve(true);
        };
        audio.onerror = () => {
          this.currentAudioElement = null;
          resolve(false);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            this.currentAudioElement = null;
            resolve(false);
          });
        }
      } catch {
        resolve(false);
      }
    });
  }

  getIsAIFallbackActive(): boolean {
    return this.isAIFallbackActive && Date.now() < this.aiFallbackUntil;
  }

  /**
   * Fetch Vietnamese speech from AI Server TTS (/api/tts) with SSML support.
   * If quota or rate limits are reached, falls back instantly to client-side Vietnamese engine.
   */
  private async fetchAIVoice(textOrSSML: string): Promise<string | null> {
    const cacheKey = textOrSSML.trim();
    if (this.ttsClientCache.has(cacheKey)) {
      return this.ttsClientCache.get(cacheKey)!;
    }

    // If cooldown is active, skip server call to avoid quota errors
    if (this.isAIFallbackActive && Date.now() < this.aiFallbackUntil) {
      return null;
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ssml: isSSML(textOrSSML) ? textOrSSML : undefined,
          text: stripSSML(textOrSSML),
          voice: 'Kore', // warm preschool female voice
        }),
      });

      if (!response.ok) {
        this.isAIFallbackActive = true;
        this.aiFallbackUntil = Date.now() + 15 * 60 * 1000;
        return null;
      }

      const data = await response.json();
      if (data && data.fallback) {
        this.isAIFallbackActive = true;
        this.aiFallbackUntil = Date.now() + 30 * 60 * 1000;
        return null;
      }

      if (data && data.audioUrl) {
        this.isAIFallbackActive = false;
        this.ttsClientCache.set(cacheKey, data.audioUrl);
        return data.audioUrl;
      }
    } catch {
      this.isAIFallbackActive = true;
      this.aiFallbackUntil = Date.now() + 10 * 60 * 1000;
    }
    return null;
  }

  /**
   * Virtual SSML Execution for Browser SpeechSynthesis:
   * Splits SSML into segments and executes speech + timed pauses seamlessly.
   */
  private async executeBrowserSSMLSequence(
    ssmlText: string,
    options?: { pitch?: number; rate?: number; onEnd?: () => void }
  ): Promise<boolean> {
    this.stopAll();
    this.isSequenceCancelled = false;

    if (!('speechSynthesis' in window)) {
      options?.onEnd?.();
      return false;
    }

    const segments = parseSSMLToSegments(ssmlText, {
      rate: options?.rate ?? 0.88,
      pitch: options?.pitch ?? 1.0,
    });

    if (segments.length === 0) {
      options?.onEnd?.();
      return false;
    }

    if (!this.bestVietnameseVoice) {
      this.selectBestVietnameseVoice();
    }

    this.isSpeaking = true;

    for (let i = 0; i < segments.length; i++) {
      if (this.isSequenceCancelled) {
        this.isSpeaking = false;
        return false;
      }

      const seg = segments[i];

      // Handle pause (<break time="450ms"/>)
      if (seg.type === 'break') {
        const pauseTime = seg.durationMs ?? this.ssmlBreakDurationMs;
        await new Promise<void>((resolve) => {
          this.activeChainTimer = setTimeout(() => {
            this.activeChainTimer = null;
            resolve();
          }, pauseTime);
        });
        continue;
      }

      // Handle speech segment (<prosody>, <emphasis>, or text)
      if (seg.type === 'speech' && seg.text) {
        await new Promise<void>((resolve) => {
          try {
            const utterance = new SpeechSynthesisUtterance(seg.text);
            utterance.lang = 'vi-VN';
            utterance.rate = seg.rate ?? (options?.rate ?? 0.88);
            utterance.pitch = seg.pitch ?? (options?.pitch ?? 1.0);

            if (this.bestVietnameseVoice) {
              utterance.voice = this.bestVietnameseVoice;
            }

            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();

            window.speechSynthesis.speak(utterance);
          } catch {
            resolve();
          }
        });
      }
    }

    this.isSpeaking = false;
    if (!this.isSequenceCancelled) {
      options?.onEnd?.();
    }
    return true;
  }

  /**
   * Speak text in Vietnamese using Web Speech API with properly verified Vietnamese voice
   */
  speakBrowserVietnamese(
    textOrSSML: string,
    options?: { pitch?: number; rate?: number; onEnd?: () => void }
  ): Promise<boolean> {
    if (isSSML(textOrSSML)) {
      return this.executeBrowserSSMLSequence(textOrSSML, options);
    }

    this.stopAll();

    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        options?.onEnd?.();
        resolve(false);
        return;
      }

      try {
        window.speechSynthesis.cancel();

        const cleanText = stripSSML(textOrSSML);
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'vi-VN';
        utterance.rate = options?.rate ?? 0.88;
        utterance.pitch = options?.pitch ?? 1.0;

        if (!this.bestVietnameseVoice) {
          this.selectBestVietnameseVoice();
        }

        if (this.bestVietnameseVoice) {
          utterance.voice = this.bestVietnameseVoice;
        }

        utterance.onend = () => {
          this.isSpeaking = false;
          options?.onEnd?.();
          resolve(true);
        };

        utterance.onerror = () => {
          this.isSpeaking = false;
          options?.onEnd?.();
          resolve(false);
        };

        this.isSpeaking = true;
        window.speechSynthesis.speak(utterance);
      } catch {
        this.isSpeaking = false;
        options?.onEnd?.();
        resolve(false);
      }
    });
  }

  /**
   * Unified speech method:
   * 1. If voiceMode is 'ai_preferred', try standard AI Vietnamese preschool teacher first (with SSML)
   * 2. If AI fails or browser_only, use browser SSML sequential execution
   */
  async speakVietnamese(
    textOrSSML: string,
    options?: { pitch?: number; rate?: number; onEnd?: () => void }
  ): Promise<boolean> {
    if (this.voiceMode === 'ai_preferred') {
      const aiAudioUrl = await this.fetchAIVoice(textOrSSML);
      if (aiAudioUrl) {
        const played = await this.playAudioUrl(aiAudioUrl);
        if (played) {
          options?.onEnd?.();
          return true;
        }
      }
    }

    if (isSSML(textOrSSML)) {
      return this.executeBrowserSSMLSequence(textOrSSML, options);
    }

    return this.speakBrowserVietnamese(textOrSSML, options);
  }

  /**
   * Alias for speakVietnamese for concise calling
   */
  async speak(
    textOrSSML: string,
    options?: { pitch?: number; rate?: number; onEnd?: () => void }
  ): Promise<boolean> {
    return this.speakVietnamese(textOrSSML, options);
  }

  /**
   * Play the question prompt: checks for custom audioUrl first, falls back to SSML-enriched Vietnamese speech
   */
  async playQuestion(
    questionText: string,
    customAudioUrl?: string,
    options?: { targetName?: string; onEnd?: () => void }
  ) {
    if (customAudioUrl && customAudioUrl.length > 10) {
      const success = await this.playAudioUrl(customAudioUrl);
      if (success) {
        options?.onEnd?.();
        return;
      }
    }

    // Auto-enrich with SSML if enabled and not already SSML
    let speechPayload = questionText;
    if (this.enableSSML && !isSSML(questionText)) {
      speechPayload = buildToddlerQuestionSSML(questionText, {
        breakDurationMs: this.ssmlBreakDurationMs,
        targetName: options?.targetName,
      });
    }

    await this.speakVietnamese(speechPayload, { onEnd: options?.onEnd });
  }

  /**
   * Play praise "Giỏi quá!" with toddler SSML melody
   */
  async playPraise(customAudioUrl?: string, onEnd?: () => void) {
    this.playSuccessChime();

    setTimeout(async () => {
      if (customAudioUrl && customAudioUrl.length > 10) {
        await this.playAudioUrl(customAudioUrl);
        onEnd?.();
      } else {
        const praises = ['Giỏi quá! Bé giỏi quá!', 'Hoan hô con! Bé giỏi lắm!'];
        const randomPraise = praises[Math.floor(Math.random() * praises.length)];

        const speechPayload = this.enableSSML
          ? buildToddlerPraiseSSML(randomPraise)
          : randomPraise;

        await this.speakVietnamese(speechPayload, { rate: 0.9, pitch: 1.0, onEnd });
      }
    }, 250);
  }

  /**
   * Play encouragement "Con thử lại nhé!" with toddler SSML gentle pacing
   */
  async playEncouragement(onEnd?: () => void) {
    this.playTryAgainChime();
    setTimeout(async () => {
      const speechPayload = this.enableSSML
        ? buildToddlerEncouragementSSML('Con thử lại nhé!')
        : 'Con thử lại nhé!';

      await this.speakVietnamese(speechPayload, { rate: 0.88, pitch: 1.0, onEnd });
    }, 200);
  }
}

export const audioEngine = new AudioEngine();
