/**
 * ====================================================================
 * TINYLEARN AUDIO MANAGER (GLOBAL AUDIO AUTHORITY - VERCEL & MOBILE TUNED)
 * ====================================================================
 * 
 * CORE RULES:
 * 1. Single source of audio: Only one audio stream plays at a time.
 *    Any new playAudio() or speak() call immediately stops the previous one.
 * 2. 4-Tier Bulletproof Priority System:
 *    - Tier 1: Pre-recorded Vietnamese MP3 audio file (audioUrl).
 *    - Tier 2A: High quality native Vietnamese female audio from /api/tts (Vercel Serverless Function or Express).
 *    - Tier 2B: Direct browser Google Translate Vietnamese TTS MP3 stream (zero-server client fallback).
 *    - Tier 3: Browser Web Speech API via speechService (fallback to lang="vi-VN" if device has no explicit voice name).
 * 3. Mobile Audio Unlock: Actively primes AudioContext, HTMLAudioElement, and SpeechSynthesis on first user touch/click.
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
  unlockSpeechSynthesis,
  SpeakOptions,
} from './speechService.ts';

export interface PlayVoiceOptions extends SpeakOptions {
  preferServerAudio?: boolean; // Try server/direct audio before falling back to browser speech
}

class AudioManager {
  private currentAudioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private isUnlocked = false;
  private isServerTtsAvailable: boolean | null = null; // null = untested, true = available, false = failed
  private serverAudioCache = new Map<string, string>();
  private unlockListenersAttached = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupMobileUnlockListener();
    }
  }

  /**
   * Complete unlock for Web Audio, HTMLAudio, and SpeechSynthesis on mobile/desktop
   */
  public unlockAudio(): void {
    if (typeof window === 'undefined') return;
    if (this.isUnlocked) return;

    try {
      // 1. Unlock Web Audio Context
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioContext) {
          this.audioContext = new AudioCtx();
        }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(() => {});
        }

        // Play silent 1ms buffer to prime iOS audio hardware
        try {
          const buffer = this.audioContext.createBuffer(1, 1, 22050);
          const source = this.audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(this.audioContext.destination);
          source.start(0);
        } catch {
          // Ignore
        }
      }

      // 2. Unlock HTMLAudioElement with silent wav
      try {
        const silentAudio = new Audio(
          'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='
        );
        silentAudio.volume = 0;
        const p = silentAudio.play();
        if (p !== undefined) {
          p.then(() => {
            silentAudio.pause();
            silentAudio.remove();
          }).catch(() => {});
        }
      } catch {
        // Ignore
      }

      // 3. Unlock Web Speech API
      unlockSpeechSynthesis();

      this.isUnlocked = true;
    } catch {
      // Ignore
    }
  }

  /**
   * Listens for first touch/click to unlock audio subsystem
   */
  private setupMobileUnlockListener() {
    if (this.unlockListenersAttached || typeof window === 'undefined') return;
    this.unlockListenersAttached = true;

    const unlockHandler = () => {
      this.unlockAudio();
      ['touchstart', 'touchend', 'click', 'pointerdown', 'keydown'].forEach((evt) => {
        window.removeEventListener(evt, unlockHandler);
      });
    };

    ['touchstart', 'touchend', 'click', 'pointerdown', 'keydown'].forEach((evt) => {
      window.addEventListener(evt, unlockHandler, { passive: true, capture: true });
    });
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
        const audio = new Audio();
        // CRITICAL: Set referrerPolicy to 'no-referrer' so third-party CDN audio (Google TTS)
        // is never blocked by Vercel referer checks (which returns 404 if referer is sent).
        try {
          (audio as any).referrerPolicy = 'no-referrer';
          audio.setAttribute('referrerpolicy', 'no-referrer');
        } catch {
          // Ignore
        }
        this.currentAudioElement = audio;

        let hasFinished = false;
        const finish = (result: HTMLAudioElement | null) => {
          if (hasFinished) return;
          hasFinished = true;
          if (this.currentAudioElement === audio) {
            this.currentAudioElement = null;
          }
          onEnd?.();
          resolve(result);
        };

        audio.onended = () => finish(audio);
        audio.onerror = (e) => {
          console.warn('[TinyLearn Audio] Audio play error:', e);
          finish(null);
        };

        audio.src = url;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[TinyLearn Audio] Autoplay prevented or aborted:', err);
            finish(null);
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
   * BULLETPROOF 3-TIER VOICE PLAYBACK:
   * - Tier 1: If audioUrl exists, play the pre-recorded MP3 file.
   * - Tier 2: Backend /api/tts endpoint (server.ts on AI Studio/localhost, api/tts.ts Serverless on Vercel).
   *           Returns 100% authentic Vietnamese female teacher voice as Base64 MP3 (never blocked by CORS/Referrer).
   * - Tier 3: Browser Web Speech API (device native Vietnamese voice, if installed).
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

    // TIER 2: High-Quality Vietnamese Female Speech from /api/tts (AI Studio, Vercel & localhost)
    if (options.preferServerAudio !== false && this.isServerTtsAvailable !== false) {
      const cacheKey = text.toLowerCase();
      const cachedUrl = this.serverAudioCache.get(cacheKey);

      if (cachedUrl) {
        const playedAudio = await this.playAudio(cachedUrl, options.onEnd);
        if (playedAudio) return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

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
            const playedAudio = await this.playAudio(data.audioUrl, options.onEnd);
            if (playedAudio) return;
          }
        }
      } catch (err) {
        console.warn('[TinyLearn Audio] /api/tts unavailable, trying device speech synthesis:', err);
      }
    }

    // TIER 3: Browser Web Speech API (Only if device has a genuine Vietnamese voice)
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

  public isAudioContextUnlocked(): boolean {
    return this.isUnlocked;
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
  unlockSpeechSynthesis,
};
