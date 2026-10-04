import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, BookOpen, Star, Award, Clock, CheckCircle2 } from 'lucide-react';
import { audioEngine } from '../utils/audio.ts';

interface ResultScreenProps {
  totalQuestions: number;
  correctCount: number;
  durationSeconds: number;
  topicName: string;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onChangeTopic: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  totalQuestions,
  correctCount,
  durationSeconds,
  topicName,
  onPlayAgain,
  onGoHome,
  onChangeTopic,
}) => {
  const percentage = Math.round((correctCount / Math.max(1, totalQuestions)) * 100);

  // Time format: X phút Y giây
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const timeFormatted =
    minutes > 0 ? `${minutes} phút ${seconds} giây` : `${seconds} giây`;

  // Rating tiers
  let ratingText = '🌟 Rất tốt';
  let ratingColor = 'text-amber-500 bg-amber-50 border-amber-300';
  let praiseVoice = 'Chúc mừng bé đã hoàn thành bài học xuất sắc! Giỏi quá!';
  if (percentage >= 90) {
    ratingText = '🌟 Rất tốt';
    ratingColor = 'text-amber-600 bg-amber-50 border-amber-300';
  } else if (percentage >= 70) {
    ratingText = '👏 Tốt';
    ratingColor = 'text-emerald-600 bg-emerald-50 border-emerald-300';
    praiseVoice = 'Hoan hô con! Bé làm tốt lắm!';
  } else {
    ratingText = '💪 Cần luyện tập thêm';
    ratingColor = 'text-blue-600 bg-blue-50 border-blue-300';
    praiseVoice = 'Con đã rất cố gắng! Chúng mình cùng chơi lại nhé!';
  }

  // Confetti on mount
  useEffect(() => {
    audioEngine.playRewardChime();
    audioEngine.speak(praiseVoice, { rate: 0.88 });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });
    } catch {
      // Ignore if canvas-confetti is not loaded
    }
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-8 flex flex-col items-center justify-center animate-fadeIn select-none">
      {/* CARD CONTAINER */}
      <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl border-4 border-amber-300 shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center">
        {/* BIG TROPHY & STAR */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-4xl sm:text-5xl shadow-lg border-4 border-white mb-4 animate-bounce">
          🌟
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-amber-950 tracking-tight mb-1">
          HOÀN THÀNH
        </h2>
        <p className="text-sm sm:text-base font-bold text-amber-800 mb-6">
          Chủ đề: <span className="underline">{topicName}</span>
        </p>

        {/* 3 CORE STATS BOXES */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {/* SỐ CÂU ĐÚNG */}
          <div className="bg-amber-50/90 p-4 rounded-2xl border-2 border-amber-200 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-amber-800 uppercase mb-1">
              Số câu đúng
            </span>
            <div className="flex items-center gap-1.5 text-2xl sm:text-3xl font-black text-amber-950">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <span>
                {correctCount} / {totalQuestions}
              </span>
            </div>
          </div>

          {/* TỶ LỆ */}
          <div className="bg-emerald-50/90 p-4 rounded-2xl border-2 border-emerald-200 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-emerald-800 uppercase mb-1">
              Tỷ lệ
            </span>
            <div className="flex items-center gap-1 text-2xl sm:text-3xl font-black text-emerald-950">
              <Award className="w-6 h-6 text-emerald-500" />
              <span>{percentage}%</span>
            </div>
          </div>

          {/* THỜI GIAN */}
          <div className="bg-sky-50/90 p-4 rounded-2xl border-2 border-sky-200 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-sky-800 uppercase mb-1">
              Thời gian
            </span>
            <div className="flex items-center gap-1.5 text-lg sm:text-xl font-black text-sky-950">
              <Clock className="w-5 h-5 text-sky-500" />
              <span>{timeFormatted}</span>
            </div>
          </div>
        </div>

        {/* EVALUATION BADGE */}
        <div className="w-full mb-6">
          <div className={`py-3 px-6 rounded-2xl border-2 font-black text-lg sm:text-xl ${ratingColor}`}>
            Đánh giá: {ratingText}
          </div>
        </div>

        {/* DETAILED PEDAGOGY BREAKDOWN */}
        <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-8 flex flex-col sm:flex-row items-center justify-around gap-3 text-sm sm:text-base font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎧</span>
            <span>Nghe hiểu:</span>
            <span className="text-emerald-600 font-black">Tốt</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-300" />
          <div className="flex items-center gap-2">
            <span className="text-xl">👆</span>
            <span>Nhận biết hình ảnh:</span>
            <span className="text-amber-600 font-black">
              {correctCount} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* 3 BIG ACTION BUTTONS */}
        <div className="w-full flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 py-3.5 px-6 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black text-base sm:text-lg rounded-2xl shadow-md border-2 border-amber-500 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Chơi lại</span>
          </button>

          <button
            type="button"
            onClick={onChangeTopic}
            className="flex-1 py-3.5 px-6 bg-gradient-to-r from-purple-400 to-indigo-400 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-base sm:text-lg rounded-2xl shadow-md border-2 border-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-5 h-5" />
            <span>Đổi chủ đề</span>
          </button>

          <button
            type="button"
            onClick={onGoHome}
            className="flex-1 py-3.5 px-6 bg-white hover:bg-slate-50 text-slate-700 font-black text-base sm:text-lg rounded-2xl shadow-md border-2 border-slate-300 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-5 h-5 text-slate-500" />
            <span>Trang chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
