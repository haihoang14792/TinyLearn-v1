import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Star, Award, Heart } from 'lucide-react';
import { audioEngine } from '../utils/audio.ts';

export interface RewardOverlayProps {
  show: boolean;
  message?: string;
  itemName?: string;
  enableSound?: boolean;
  enableConfetti?: boolean;
  onDismiss?: () => void;
}

export const RewardOverlay: React.FC<RewardOverlayProps> = ({
  show,
  message = 'GIỎI QUÁ! BÉ ĐÚNG RỒI!',
  itemName,
  enableSound = true,
  enableConfetti = true,
  onDismiss,
}) => {
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (show && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;

      // 1. Play subtle, gentle sound effects: sweet glockenspiel twinkle + soft rhythmic applause
      if (enableSound) {
        audioEngine.playRewardChime();
        // Trigger soft clapping sound effect slightly staggered
        setTimeout(() => {
          audioEngine.playClappingApplause();
        }, 80);
      }

      // 2. Trigger brief, gentle confetti fireworks animation with soft toddler pastel colors
      if (enableConfetti) {
        // Main center gentle burst
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.62 },
          colors: ['#FFD166', '#FF9F1C', '#06D6A0', '#48CAE4', '#F72585', '#FFF3B0'],
          ticks: 150,
          gravity: 0.75,
          scalar: 1.15,
          disableForReducedMotion: true,
        });

        // Left & right gentle upward bursts
        const timer1 = setTimeout(() => {
          confetti({
            particleCount: 22,
            angle: 60,
            spread: 45,
            origin: { x: 0.18, y: 0.68 },
            colors: ['#FFE066', '#FFD166', '#48CAE4', '#FF85A1'],
            shapes: ['circle', 'star'],
            ticks: 130,
            gravity: 0.7,
            scalar: 1.1,
            disableForReducedMotion: true,
          });

          confetti({
            particleCount: 22,
            angle: 120,
            spread: 45,
            origin: { x: 0.82, y: 0.68 },
            colors: ['#FFE066', '#FFD166', '#48CAE4', '#FF85A1'],
            shapes: ['circle', 'star'],
            ticks: 130,
            gravity: 0.7,
            scalar: 1.1,
            disableForReducedMotion: true,
          });
        }, 140);

        return () => clearTimeout(timer1);
      }
    } else if (!show) {
      hasTriggeredRef.current = false;
    }
  }, [show, enableSound, enableConfetti]);

  if (!show) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-4 select-none"
      aria-live="polite"
    >
      <div className="relative flex flex-col items-center justify-center animate-in fade-in zoom-in-75 duration-200">
        {/* Soft glowing ambient light ring */}
        <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-amber-400/35 via-yellow-300/35 to-emerald-400/35 blur-2xl pointer-events-none" />

        {/* CLAPPING HANDS ANIMATION CONTAINER */}
        <div className="relative mb-2 flex items-center justify-center">
          {/* Floating celebratory sparkles around the clapping hands */}
          <div className="absolute -top-6 -left-6 text-2xl animate-sparkle-float">✨</div>
          <div className="absolute -top-7 right-[-10px] text-2xl animate-sparkle-float [animation-delay:0.3s]">⭐</div>
          <div className="absolute top-1 -right-8 text-xl animate-sparkle-float [animation-delay:0.6s]">💛</div>
          <div className="absolute top-2 -left-8 text-xl animate-sparkle-float [animation-delay:0.45s]">🌟</div>

          {/* Animated Clapping Hands Emoji / Badge */}
          <div className="flex items-center gap-2 p-3 bg-white/95 rounded-full shadow-xl border-3 border-amber-300 animate-clap-hands">
            <span className="text-4xl sm:text-5xl" role="img" aria-label="Vỗ tay hoan hô">
              👏
            </span>
            <span className="text-4xl sm:text-5xl" role="img" aria-label="Vỗ tay hoan hô">
              👏
            </span>
          </div>
        </div>

        {/* MAIN CELEBRATION PILL */}
        <div className="relative px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-300 rounded-full border-4 border-white shadow-2xl flex items-center gap-3 sm:gap-4 animate-joyful-bounce">
          <span className="text-3xl sm:text-4xl animate-bounce">⭐</span>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950/80">
              <Sparkles className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
              <span>{itemName ? `Bé tìm đúng ${itemName} rồi! Hoan hô!` : 'Khen thưởng bé yêu • Vỗ tay nào!'}</span>
              <Sparkles className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
            </div>
            <div className="text-lg sm:text-2xl font-black text-amber-950 tracking-tight leading-tight">
              {message}
            </div>
          </div>

          <span className="text-3xl sm:text-4xl animate-bounce">🎉</span>
        </div>
      </div>
    </div>
  );
};
