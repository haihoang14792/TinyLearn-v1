import React from 'react';
import { Star } from 'lucide-react';

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  correctCount?: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentQuestion,
  totalQuestions,
  correctCount = 0,
  className = '',
}) => {
  const percentage = Math.min(
    100,
    Math.max(0, Math.round(((currentQuestion - 1) / Math.max(1, totalQuestions)) * 100))
  );

  return (
    <div className={`w-full max-w-xl mx-auto flex flex-col gap-1.5 select-none ${className}`}>
      {/* Top Labels */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-black text-slate-700 px-1">
        <span className="bg-amber-100/90 text-amber-900 px-3 py-1 rounded-full border border-amber-300 shadow-xs">
          Câu {currentQuestion} / {totalQuestions}
        </span>
        <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-900 px-3 py-1 rounded-full border border-yellow-300 shadow-xs">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-400 animate-spin-slow" />
          <span>{correctCount} sao</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-4 sm:h-5 bg-amber-100/80 rounded-full p-1 border-2 border-amber-200/90 shadow-inner overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-xs"
          style={{ width: `${Math.max(6, percentage)}%` }}
        />
      </div>
    </div>
  );
};
