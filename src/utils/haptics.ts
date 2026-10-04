/**
 * Haptic Feedback Engine for TinyLearn
 * Specially calibrated for toddlers (12–24 months) touch interactions:
 * - Gentle, warm tactile reward on correct choice
 * - Subtle, non-punishing tap on wrong choice
 * - Micro-tap on card touch
 */

class HapticsEngine {
  private isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'navigator' in window &&
      typeof navigator.vibrate === 'function'
    );
  }

  /**
   * Joyful celebratory vibration when toddler picks the correct card:
   * Upbeat double-tap (50ms pulse, 40ms pause, 90ms warm finish)
   */
  triggerSuccess(enabled: boolean = true) {
    if (!enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([50, 40, 90]);
    } catch {
      // Ignore vibration permissions or unsupported environment
    }
  }

  /**
   * Gentle, soft feedback when toddler picks the wrong card:
   * Two soft, low-intensity micro pulses (30ms pulse, 50ms pause, 30ms pulse)
   * Designed to be non-startling and gentle for 12–24m toddlers.
   */
  triggerWrong(enabled: boolean = true) {
    if (!enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([30, 50, 30]);
    } catch {
      // Ignore
    }
  }

  /**
   * Subtle micro-tap when toddler touches a card or big button
   */
  triggerTap(enabled: boolean = true) {
    if (!enabled || !this.isSupported()) return;
    try {
      navigator.vibrate(18);
    } catch {
      // Ignore
    }
  }

  /**
   * Check if current device supports the Web Vibration API
   */
  hasHapticsSupport(): boolean {
    return this.isSupported();
  }
}

export const hapticsEngine = new HapticsEngine();
