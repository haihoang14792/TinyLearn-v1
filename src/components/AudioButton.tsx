import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { audioEngine } from '../utils/audio.ts';

interface AudioButtonProps {
  textToSpeak: string;
  label?: string;
  className?: string;
  size?: 'md' | 'lg' | 'xl';
  disabled?: boolean;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  textToSpeak,
  label = 'Nghe lại',
  className = '',
  size = 'lg',
  disabled = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || !textToSpeak) return;

    setIsPlaying(true);
    audioEngine.stopAll();
    audioEngine.speak(textToSpeak, {
      rate: 0.88,
      onEnd: () => setIsPlaying(false),
    });
  };

  const sizeClasses = {
    md: 'px-4 py-2 text-sm sm:text-base gap-2 rounded-2xl',
    lg: 'px-6 py-3 text-base sm:text-lg gap-2.5 rounded-3xl',
    xl: 'px-8 py-4 text-xl sm:text-2xl gap-3 rounded-3xl',
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-black bg-gradient-to-b from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-amber-950 border-3 border-amber-500 shadow-md active:scale-95 transition-all cursor-pointer select-none ${
        isPlaying ? 'ring-4 ring-amber-300 ring-offset-2 animate-pulse' : ''
      } ${sizeClasses[size]} ${className}`}
      title="Bấm để nghe lại"
    >
      <Volume2 className={`${size === 'xl' ? 'w-8 h-8' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} ${isPlaying ? 'animate-bounce text-amber-900' : ''}`} />
      <span>{label}</span>
      {isPlaying && (
        <span className="flex gap-1 ml-1 items-center">
          <span className="w-1.5 h-3 bg-amber-900 rounded-full animate-pulse" />
          <span className="w-1.5 h-4 bg-amber-900 rounded-full animate-pulse delay-75" />
          <span className="w-1.5 h-2 bg-amber-900 rounded-full animate-pulse delay-150" />
        </span>
      )}
    </button>
  );
};
