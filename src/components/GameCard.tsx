import React, { useState } from 'react';
import { TopicItemData } from '../data/topics.ts';

interface GameCardProps {
  item: TopicItemData;
  isCorrectTarget: boolean;
  status: 'idle' | 'correct' | 'wrong';
  onSelect: (item: TopicItemData) => void;
  disabled?: boolean;
  layoutCount: 2 | 3 | 4;
}

export const GameCard: React.FC<GameCardProps> = ({
  item,
  isCorrectTarget,
  status,
  onSelect,
  disabled = false,
  layoutCount,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    onSelect(item);
  };

  // Border & Glow styling based on status
  let stateClasses = 'border-4 border-slate-200/90 shadow-md hover:border-amber-300 hover:shadow-xl';
  if (status === 'correct') {
    stateClasses =
      'border-6 border-emerald-400 bg-emerald-50/90 shadow-2xl scale-[1.05] ring-8 ring-emerald-200 animate-pulse';
  } else if (status === 'wrong') {
    stateClasses = 'border-4 border-amber-300 bg-amber-50/60 opacity-80 animate-wiggle';
  }

  // Size tuning based on layout count (2, 3, or 4 pictures on screen)
  const sizeClasses = {
    2: 'p-6 sm:p-8 min-h-[220px] sm:min-h-[300px]',
    3: 'p-4 sm:p-6 min-h-[190px] sm:min-h-[250px]',
    4: 'p-3 sm:p-5 min-h-[160px] sm:min-h-[210px]',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      disabled={disabled}
      style={{
        borderRadius: '24px',
        backgroundColor: item.bgColor || '#FFFBEB',
      }}
      className={`relative w-full flex flex-col items-center justify-between text-center select-none cursor-pointer transition-all duration-300 transform-gpu ${
        isPressed ? 'scale-[0.98]' : 'hover:scale-[1.03]'
      } ${sizeClasses[layoutCount]} ${stateClasses}`}
    >
      {/* Visual reward badge on correct selection */}
      {status === 'correct' && (
        <div className="absolute -top-4 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-black text-xs sm:text-sm px-3 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1 animate-bounce z-20">
          <span>⭐</span>
          <span>Giỏi quá!</span>
          <span>🎉</span>
        </div>
      )}

      {/* Gentle helper on wrong */}
      {status === 'wrong' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-0.5 rounded-full border border-amber-300 shadow-xs z-20">
          Bé thử lại nhé ✨
        </div>
      )}

      {/* Big Crisp Picture */}
      <div className="flex-1 w-full flex items-center justify-center p-2">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-auto max-h-[140px] sm:max-h-[190px] object-contain drop-shadow-sm pointer-events-none transition-transform duration-300"
          loading="eager"
        />
      </div>

      {/* Item Name (Clear, bold, easy to recognize for toddlers) */}
      <div className="w-full pt-2">
        <span className="inline-block px-4 py-1.5 bg-white/90 backdrop-blur-xs text-slate-800 font-black text-lg sm:text-2xl rounded-2xl border-2 border-slate-200/80 shadow-xs tracking-wide">
          {item.name}
        </span>
      </div>
    </button>
  );
};
