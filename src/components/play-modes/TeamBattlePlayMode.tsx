import React, { useState } from 'react';
import { Trophy, Star, Sparkles, RotateCcw, Zap, Flame } from 'lucide-react';
import { TopicItem } from '../../types.ts';
import { audioEngine } from '../../utils/audio.ts';
import { hapticsEngine } from '../../utils/haptics.ts';

interface TeamBattlePlayModeProps {
  targetItem: TopicItem;
  displayChoices: TopicItem[];
  team1Score: number;
  team2Score: number;
  onTeamWinRound: (winningTeam: 'red' | 'blue') => void;
  onResetScore: () => void;
  enableHaptics?: boolean;
}

export const TeamBattlePlayMode: React.FC<TeamBattlePlayModeProps> = ({
  targetItem,
  displayChoices,
  team1Score,
  team2Score,
  onTeamWinRound,
  onResetScore,
  enableHaptics = true,
}) => {
  const [roundWinner, setRoundWinner] = useState<'red' | 'blue' | null>(null);
  const [wobbleTeamSide, setWobbleTeamSide] = useState<'red' | 'blue' | null>(null);

  // Handle a child tapping a choice on their team's side
  const handleChoiceClick = (choice: TopicItem, team: 'red' | 'blue') => {
    if (roundWinner) return;

    if (choice.id === targetItem.id) {
      // This team hit the correct item first!
      setRoundWinner(team);
      hapticsEngine.triggerSuccess(enableHaptics);
      audioEngine.playSuccessChime();

      setTimeout(() => {
        onTeamWinRound(team);
        setRoundWinner(null);
      }, 1500);
    } else {
      // Wrong choice by this team
      hapticsEngine.triggerWrong(enableHaptics);
      audioEngine.playTryAgainChime();
      setWobbleTeamSide(team);
      setTimeout(() => setWobbleTeamSide(null), 600);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-between gap-4 py-1 select-none">
      {/* 1. SCOREBOARD (BẢNG ĐIỂM THI ĐẤU 2 ĐỘI) */}
      <div className="w-full max-w-4xl bg-white/95 p-3 sm:p-4 rounded-3xl border-3 border-amber-300 shadow-md flex items-center justify-between gap-3">
        {/* TEAM 1: ĐỘI ĐỎ (THỎ TRẮNG) */}
        <div className="flex-1 flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-xs">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-2xl shadow-sm">
            🐰
          </div>
          <div>
            <div className="text-[11px] font-black uppercase text-rose-700 tracking-wider">
              Đội Thỏ Trắng
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-rose-600">
                {team1Score}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(5, team1Score) }).map((_, i) => (
                  <Star key={`red_star_${i}`} className="w-4 h-4 fill-amber-400 text-amber-500" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER VS TROPHY */}
        <div className="flex flex-col items-center justify-center px-2">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-amber-950 shadow-md border-2 border-white animate-pulse">
            <Trophy className="w-5 h-5 text-amber-900" />
          </div>
          <span className="text-[10px] font-black uppercase text-amber-800 tracking-widest mt-1">
            Thi Đấu
          </span>
        </div>

        {/* TEAM 2: ĐỘI XANH (GẤU NÂU) */}
        <div className="flex-1 flex items-center justify-end text-right gap-2 sm:gap-3 p-2 sm:p-3 rounded-2xl bg-sky-50 border-2 border-sky-300 shadow-xs">
          <div>
            <div className="text-[11px] font-black uppercase text-sky-700 tracking-wider">
              Đội Gấu Nâu
            </div>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(5, team2Score) }).map((_, i) => (
                  <Star key={`blue_star_${i}`} className="w-4 h-4 fill-amber-400 text-amber-500" />
                ))}
              </div>
              <span className="text-xl sm:text-2xl font-black text-sky-600">
                {team2Score}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-2xl shadow-sm">
            🐻
          </div>
        </div>

        {/* Reset score button */}
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Cô có muốn đặt lại điểm số về 0 để thi đấu hiệp mới không?')) {
              onResetScore();
            }
          }}
          title="Đặt lại điểm số"
          className="p-2 text-slate-400 hover:text-amber-800 hover:bg-amber-100 rounded-xl transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. SPLIT BATTLEFIELD (HAI NỬA MÀN HÌNH ĐỐI XỨNG CHO 2 BÉ CHẠM THI) */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-1">
        {/* RED TEAM HALF (BÊN TRÁI) */}
        <div
          className={`p-4 sm:p-5 rounded-4xl border-4 transition-all duration-300 flex flex-col items-center justify-between ${
            roundWinner === 'red'
              ? 'bg-rose-100 border-rose-500 ring-8 ring-rose-300 scale-102 shadow-2xl'
              : wobbleTeamSide === 'red'
              ? 'bg-rose-50 border-rose-400 animate-gentle-wobble'
              : 'bg-rose-50/70 border-rose-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-rose-200">
            <span className="text-xs font-black text-rose-800 flex items-center gap-1.5">
              <span>🐰</span>
              <span>Sân Đội Thỏ Trắng:</span>
            </span>
            {roundWinner === 'red' && (
              <span className="text-xs font-black px-3 py-1 bg-rose-500 text-white rounded-full animate-bounce">
                +1 Điểm! Thắng Vòng!
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 w-full">
            {displayChoices.map((choice) => {
              const isTarget = choice.id === targetItem.id;
              const isWinningCard = roundWinner === 'red' && isTarget;

              return (
                <button
                  key={`red_choice_${choice.id}`}
                  type="button"
                  onClick={() => handleChoiceClick(choice, 'red')}
                  className={`p-3 rounded-3xl border-3 flex flex-col items-center justify-center transition-transform active:scale-95 cursor-pointer min-h-[120px] sm:min-h-[140px] ${
                    isWinningCard
                      ? 'bg-emerald-100 border-emerald-500 ring-4 ring-emerald-300 scale-105 shadow-xl'
                      : 'bg-white hover:bg-rose-50/80 border-slate-200 hover:border-rose-300 shadow-xs'
                  }`}
                >
                  <div className="w-14 h-14 sm:w-18 sm:h-18 flex items-center justify-center">
                    <img
                      src={choice.imageUrl}
                      alt={choice.name}
                      className="w-full h-full object-contain filter drop-shadow-xs"
                    />
                  </div>
                  <span className="mt-1 text-xs font-black text-slate-800 line-clamp-1">
                    {choice.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* BLUE TEAM HALF (BÊN PHẢI) */}
        <div
          className={`p-4 sm:p-5 rounded-4xl border-4 transition-all duration-300 flex flex-col items-center justify-between ${
            roundWinner === 'blue'
              ? 'bg-sky-100 border-sky-500 ring-8 ring-sky-300 scale-102 shadow-2xl'
              : wobbleTeamSide === 'blue'
              ? 'bg-sky-50 border-sky-400 animate-gentle-wobble'
              : 'bg-sky-50/70 border-sky-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-sky-200">
            <span className="text-xs font-black text-sky-800 flex items-center gap-1.5">
              <span>🐻</span>
              <span>Sân Đội Gấu Nâu:</span>
            </span>
            {roundWinner === 'blue' && (
              <span className="text-xs font-black px-3 py-1 bg-sky-500 text-white rounded-full animate-bounce">
                +1 Điểm! Thắng Vòng!
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 w-full">
            {displayChoices.map((choice) => {
              const isTarget = choice.id === targetItem.id;
              const isWinningCard = roundWinner === 'blue' && isTarget;

              return (
                <button
                  key={`blue_choice_${choice.id}`}
                  type="button"
                  onClick={() => handleChoiceClick(choice, 'blue')}
                  className={`p-3 rounded-3xl border-3 flex flex-col items-center justify-center transition-transform active:scale-95 cursor-pointer min-h-[120px] sm:min-h-[140px] ${
                    isWinningCard
                      ? 'bg-emerald-100 border-emerald-500 ring-4 ring-emerald-300 scale-105 shadow-xl'
                      : 'bg-white hover:bg-sky-50/80 border-slate-200 hover:border-sky-300 shadow-xs'
                  }`}
                >
                  <div className="w-14 h-14 sm:w-18 sm:h-18 flex items-center justify-center">
                    <img
                      src={choice.imageUrl}
                      alt={choice.name}
                      className="w-full h-full object-contain filter drop-shadow-xs"
                    />
                  </div>
                  <span className="mt-1 text-xs font-black text-slate-800 line-clamp-1">
                    {choice.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
