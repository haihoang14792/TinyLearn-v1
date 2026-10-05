/**
 * ====================================================================
 * TINYLEARN AUDIO MANAGER (GLOBAL AUDIO AUTHORITY)
 * ====================================================================
 * 
 * CORE RULES:
 * 1. Single source of audio: Only one audio stream plays at a time.
 *    Any new playAudio() or speak() call immediately stops the previous one.
 * 2. 3-Tier Priority System:
 *    - Priority 1: Pre-recorded Vietnamese MP3 audio file (audioUrl).
 *    - Priority 2: High quality native Vietnamese female audio from /api/tts.
 *    - Priority 3: Browser Web Speech API via speechService.
 * 3. Mobile Audio Unlock: Handles audio context initialization on user gesture.
 * 4. Friendly Toddler Sound Effects (Pop, Chime, Fanfare, Correct, Try Again).
 */

import {
  speakVietnamese,
  stopSpeaking,
  normalizeTextForSpeech,
  isSpeechSupported,
  getBestVietnameseVoice,
  getVietnameseVoices,
  hasVietnameseVoice,
  loadVoices,
  SpeakOptions,
} from './speechService.ts';

export interface PlayVoiceOptions extends SpeakOptions {
  preferServerAudio?: boolean; // Try /api/tts before falling back to browser speech
}

class AudioManager {
  private currentAudioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private isUnlocked = false;
  private serverAudioCache = new Map<string, string>();

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupMobileUnlockListener();
    }
  }

  /**
   * Unlocks Web Audio on mobile touch/click
   */
  private setupMobileUnlockListener() {
    const unlock = () => {
      if (this.isUnlocked) return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          if (!this.audioContext) {
            this.audioContext = new AudioCtx();
          }
          if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
          }
        }
        this.isUnlocked = true;
      } catch {
        // Ignore
      }
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
    };

    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
  }

  /**
   * Lazily gets or creates the Web Audio Context
   */
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.audioContext = new AudioCtx();
        }
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
      return this.audioContext;
    } catch {
      return null;
    }
  }

  /**
   * STOP ALL ACTIVE SOUNDS:
   * Cancels SpeechSynthesis and pauses/destroys any playing HTMLAudioElement.
   * MUST be called before any new audio or speech begins.
   */
  public stopAll(): void {
    // 1. Stop Speech Synthesis
    stopSpeaking();

    // 2. Stop HTML Audio element
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
        this.currentAudioElement.src = '';
        this.currentAudioElement.remove();
      } catch {
        // Ignore
      }
      this.currentAudioElement = null;
    }
  }

  /**
   * Plays an audio file URL (e.g. MP3, WAV, base64 data URL).
   * Stops any currently playing audio first.
   */
  public playAudio(url: string, onEnd?: () => void): Promise<HTMLAudioElement | null> {
    if (!url || typeof window === 'undefined') {
      onEnd?.();
      return Promise.resolve(null);
    }

    this.stopAll();

    return new Promise((resolve) => {
      try {
        const audio = new Audio(url);
        this.currentAudioElement = audio;

        audio.onended = () => {
          if (this.currentAudioElement === audio) {
            this.currentAudioElement = null;
          }
          onEnd?.();
          resolve(audio);
        };

        audio.onerror = (e) => {
          console.warn('[TinyLearn Audio] Audio play error:', e);
          if (this.currentAudioElement === audio) {
            this.currentAudioElement = null;
          }
          onEnd?.();
          resolve(null);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[TinyLearn Audio] Autoplay prevented or aborted:', err);
            onEnd?.();
            resolve(null);
          });
        }
      } catch (err) {
        console.warn('[TinyLearn Audio] Failed to instantiate Audio:', err);
        onEnd?.();
        resolve(null);
      }
    });
  }

  /**
   * Speaks Vietnamese text using Web Speech API.
   * Stops any currently playing audio first.
   */
  public speak(text: string, options: SpeakOptions = {}): boolean {
    this.stopAll();
    return speakVietnamese(text, options);
  }

  /**
   * 3-TIER PRIORITY VOICE PLAYBACK:
   * - Priority 1: If audioUrl exists, play the pre-recorded MP3 file.
   * - Priority 2: If preferServerAudio is true, attempt /api/tts for authentic Vietnamese female teacher voice.
   * - Priority 3: Fall back to client Web Speech API with native Vietnamese female voice.
   */
  public async playVoice(
    rawText: string,
    audioUrl?: string,
    options: PlayVoiceOptions = {}
  ): Promise<void> {
    const text = normalizeTextForSpeech(rawText);
    if (!text && !audioUrl) {
      options.onEnd?.();
      return;
    }

    // TIER 1: Dedicated Pre-recorded Audio File
    if (audioUrl && audioUrl.trim()) {
      await this.playAudio(audioUrl.trim(), options.onEnd);
      return;
    }

    // TIER 2: High Quality Server-Side Vietnamese TTS (if requested / available)
    if (options.preferServerAudio !== false) {
      const cacheKey = text.toLowerCase();
      if (this.serverAudioCache.has(cacheKey)) {
        const cachedUrl = this.serverAudioCache.get(cacheKey)!;
        await this.playAudio(cachedUrl, options.onEnd);
        return;
      }

      // Try fetching authentic Vietnamese teacher voice from backend
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s quick timeout

        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.audioUrl && !data.fallback) {
            this.serverAudioCache.set(cacheKey, data.audioUrl);
            await this.playAudio(data.audioUrl, options.onEnd);
            return;
          }
        }
      } catch {
        // Network offline or timeout, proceed to Tier 3
      }
    }

    // TIER 3: Client Browser Web Speech API
    this.speak(text, options);
  }

  /**
   * Toddler Sound Effects via Web Audio Glockenspiel / Chimes
   */
  public playSfx(type: 'correct' | 'wrong' | 'pop' | 'chime' | 'fanfare' | 'soft_click'): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (type === 'correct' || type === 'chime') {
        // Bright friendly xylophone 2-tone (C5 -> G5)
        [523.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.48);
        });
      } else if (type === 'wrong') {
        // Gentle soft wooden thud (never harsh or scary)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.26);
      } else if (type === 'pop') {
        // Water bubble pop for button clicks
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'fanfare') {
        // Joyful chord progression (C-E-G-C)
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);

          gain.gain.setValueAtTime(0, now + idx * 0.09);
          gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.09 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.65);
        });
      }
    } catch {
      // Ignore audio synthesis errors
    }
  }

  // Convenience methods
  public playPop() {
    this.playSfx('pop');
  }

  public playSuccessChime() {
    this.playSfx('correct');
  }

  public playSoftThud() {
    this.playSfx('wrong');
  }

  public playFanfare() {
    this.playSfx('fanfare');
  }
}

// Global Singleton Instance
export const audioManager = new AudioManager();

// Export helpers directly from speechService
export {
  loadVoices,
  getVietnameseVoices,
  getBestVietnameseVoice,
  hasVietnameseVoice,
  isSpeechSupported,
  normalizeTextForSpeech,
  stopSpeaking,
  speakVietnamese,
};
