import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Maximize,
  Minimize,
  Lightbulb,
  ArrowRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { PreschoolActivity, ChoiceItem } from '../../data/activityTypes.ts';
import { audioEngine } from '../../utils/audio.ts';
import { hapticsEngine } from '../../utils/haptics.ts';

interface ToddlerActivityCanvasProps {
  activity: PreschoolActivity;
  soundEnabled: boolean;
  onActivityComplete: () => void;
  onExit: () => void;
}

export const ToddlerActivityCanvas: React.FC<ToddlerActivityCanvasProps> = ({
  activity,
  soundEnabled,
  onActivityComplete,
  onExit,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Record<string, 'idle' | 'correct' | 'wrong'>>({});
  const [isLocked, setIsLocked] = useState(false);
  const [isTeacherHintActive, setIsTeacherHintActive] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Fullscreen listener
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Speak prompt on mount
  useEffect(() => {
    if (soundEnabled) {
      setTimeout(() => {
        audioEngine.stopAll();
        audioEngine.speak(activity.teacherPrompt, { rate: 0.85 });
      }, 350);
    }
  }, [activity.id]);

  // Handle choice selection
  const handleChoice = (choice: ChoiceItem) => {
    if (isLocked) return;

    if (choice.correct) {
      // Correct!
      setIsLocked(true);
      setSelectedStatus((prev) => ({ ...prev, [choice.id]: 'correct' }));
      hapticsEngine.triggerSuccess(true);

      if (soundEnabled) {
        audioEngine.playSuccessChime();
        const praises = activity.encouragement.length > 0
          ? activity.encouragement
          : ['Đúng rồi!', 'Giỏi quá!'];
        const randomPraise = praises[Math.floor(Math.random() * praises.length)];

        setTimeout(() => {
          audioEngine.speak(randomPraise, { rate: 0.88 });
        }, 300);
      }

      // Gentle celebration
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
        });
      } catch {
        // Ignore
      }

      // Auto finish to teacher observation after 1.4s
      setTimeout(() => {
        onActivityComplete();
      }, 1400);
    } else {
      // Not yet correct (gentle, no X, no penalty)
      setSelectedStatus((prev) => ({ ...prev, [choice.id]: 'wrong' }));
      hapticsEngine.triggerWrong(true);
      setRetryCount((c) => c + 1);

      if (soundEnabled) {
        audioEngine.playTryAgainChime();
        audioEngine.speak(activity.retryPrompt || 'Con tìm lại nhé.', { rate: 0.85 });
      }

      // Clear wobble state after 600ms so child can tap again
      setTimeout(() => {
        setSelectedStatus((prev) => ({ ...prev, [choice.id]: 'idle' }));
      }, 650);
    }
  };

  const handleReplayAudio = () => {
    if (!soundEnabled) return;
    audioEngine.stopAll();
    audioEngine.speak(activity.teacherPrompt, { rate: 0.85 });
  };

  const handleTeacherHint = () => {
    setIsTeacherHintActive(true);
    audioEngine.playPop();
    setTimeout(() => {
      setIsTeacherHintActive(false);
    }, 2500);
  };

  const isSingleCard = activity.choices.length === 1;

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-amber-50/80 via-orange-50/40 to-yellow-50/70 p-4 sm:p-6 flex flex-col justify-between select-none">
      {/* 1. TOP TEACHER & ACCESSIBILITY BAR */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Discrete Exit button for teacher */}
        <button
          type="button"
          onClick={onExit}
          className="px-3.5 py-2 rounded-2xl bg-white/90 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
          title="Thoát về giao diện giáo viên"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
          <span>Thoát</span>
        </button>

        {/* Center: Activity Name & Group */}
        <div className="text-center">
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-300">
            {activity.ageGroup === '12-18' ? 'Nhóm 12–18 tháng' : 'Nhóm 18–24 tháng'}
          </span>
        </div>

        {/* Right tools: Cô gợi ý & Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Teacher hint helper button */}
          {!isSingleCard && (
            <button
              type="button"
              onClick={handleTeacherHint}
              className="px-3 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs sm:text-sm border border-amber-300 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
              title="Cô bấm để làm nổi nhẹ hình đúng giúp bé chú ý"
            >
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Cô gợi ý</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-xs cursor-pointer active:scale-95 transition-all"
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. MAIN PROMPT & RE-LISTEN */}
      <main className="w-full max-w-3xl mx-auto flex-1 flex flex-col items-center justify-center my-4">
        {/* LARGE SPOKEN PROMPT CARD */}
        <div className="w-full bg-white/95 rounded-3xl border-3 border-amber-300 shadow-md p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-black text-amber-800 uppercase tracking-wider block">
              Lời Cô Hướng Dẫn:
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight leading-snug mt-1">
              “{activity.teacherPrompt}”
            </h1>
          </div>

          {/* BIG AUDIO REPLAY BUTTON */}
          <button
            type="button"
            onClick={handleReplayAudio}
            className="py-3 px-6 bg-gradient-to-b from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black text-base sm:text-lg rounded-2xl border-2 border-amber-500 shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all shrink-0"
          >
            <Volume2 className="w-6 h-6 text-amber-900" />
            <span>Nghe lại</span>
          </button>
        </div>

        {/* 3. CHOICES CARDS (2 or 3 CARDS, OR 1 BIG CARD FOR MOVEMENT/SPEAK) */}
        {isSingleCard ? (
          /* SINGLE CARD ACTIVITY (MOVEMENT / IMITATION SPEAK) */
          <div className="w-full max-w-md flex flex-col items-center justify-center gap-6 animate-fadeIn">
            <div
              style={{
                borderRadius: '28px',
                backgroundColor: activity.choices[0].bgColor || '#FFFBEB',
              }}
              className="w-full p-6 sm:p-8 border-4 border-amber-300 shadow-xl flex flex-col items-center justify-center text-center"
            >
              <img
                src={activity.choices[0].image}
                alt={activity.choices[0].name}
                className="w-48 h-48 sm:w-60 sm:h-60 object-contain drop-shadow-md mb-4"
              />
              <span className="px-6 py-2 bg-white/90 text-slate-900 font-black text-2xl sm:text-3xl rounded-2xl border-2 border-slate-200">
                {activity.choices[0].name}
              </span>
            </div>

            {/* Teacher next button */}
            <button
              type="button"
              onClick={onActivityComplete}
              className="w-full py-4 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xl sm:text-2xl rounded-3xl shadow-lg border-2 border-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer animate-bounce"
            >
              <span>Tiếp tục hoạt động</span>
              <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>
        ) : (
          /* 2 OR 3 LARGE INTERACTIVE TOUCH CARDS */
          <div
            className={`w-full grid gap-4 sm:gap-6 ${
              activity.choices.length === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
                : 'grid-cols-1 sm:grid-cols-3 max-w-3xl'
            }`}
          >
            {activity.choices.map((choice) => {
              const status = selectedStatus[choice.id] || 'idle';
              const isHinted = isTeacherHintActive && choice.correct;

              let cardStyle =
                'border-4 border-slate-200/90 shadow-md hover:border-amber-300 hover:shadow-xl';
              if (status === 'correct') {
                cardStyle =
                  'border-6 border-emerald-400 bg-emerald-50/90 shadow-2xl scale-[1.05] ring-8 ring-emerald-200 animate-pulse';
              } else if (status === 'wrong') {
                cardStyle =
                  'border-4 border-amber-300 bg-amber-50/60 opacity-80 animate-wiggle';
              } else if (isHinted) {
                cardStyle =
                  'border-6 border-amber-400 bg-amber-50 shadow-2xl scale-[1.04] ring-8 ring-amber-200 animate-pulse';
              }

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleChoice(choice)}
                  disabled={isLocked}
                  style={{
                    borderRadius: '24px',
                    backgroundColor: choice.bgColor || '#FFFBEB',
                  }}
                  className={`relative w-full flex flex-col items-center justify-between text-center select-none cursor-pointer transition-all duration-300 p-6 sm:p-8 min-h-[220px] sm:min-h-[280px] hover:scale-[1.03] active:scale-[0.98] ${cardStyle}`}
                >
                  {/* Reward star on correct */}
                  {status === 'correct' && (
                    <div className="absolute -top-4 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-black text-xs sm:text-sm px-3.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1 animate-bounce z-20">
                      <span>⭐</span>
                      <span>Giỏi quá!</span>
                      <span>🎉</span>
                    </div>
                  )}

                  {/* Big Image */}
                  <div className="flex-1 w-full flex items-center justify-center p-2">
                    <img
                      src={choice.image}
                      alt={choice.name}
                      className="w-full h-auto max-h-[140px] sm:max-h-[180px] object-contain drop-shadow-sm pointer-events-none"
                    />
                  </div>

                  {/* Name label */}
                  <div className="w-full pt-2">
                    <span className="inline-block px-4 py-1.5 bg-white/90 text-slate-800 font-black text-lg sm:text-2xl rounded-2xl border-2 border-slate-200/80 shadow-xs">
                      {choice.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* 4. FOOTER NOTE */}
      <footer className="w-full max-w-4xl mx-auto text-center pt-2">
        <span className="text-xs sm:text-sm font-bold text-amber-800/80 inline-flex items-center gap-1.5 bg-amber-100/50 px-3.5 py-1 rounded-full">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Bé chạm vào hình theo lời cô hướng dẫn nhé!</span>
        </span>
      </footer>
    </div>
  );
};
