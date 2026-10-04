import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Volume2,
  ChevronRight,
  RotateCcw,
  Maximize2,
  Minimize2,
  Settings,
  Sparkles,
  Star,
  Tv,
  ArrowLeft,
  Eye,
  EyeOff,
  Lightbulb,
} from 'lucide-react';
import { TopicGame, TopicItem, PreschoolSettings, ChildProfile } from '../types.ts';
import { audioEngine } from '../utils/audio.ts';
import { stripSSML } from '../utils/ssml.ts';
import { hapticsEngine } from '../utils/haptics.ts';
import { recordTopicAttempt, recordTopicCompleted, recordChildActivityResult } from '../utils/storage.ts';
import { fireBigVictoryCelebration } from '../utils/celebration.ts';
import { RewardOverlay } from './RewardOverlay.tsx';
import { getFallbackDistractors } from '../data/illustrations.ts';
import { DragDropPlayMode } from './play-modes/DragDropPlayMode.tsx';
import { JigsawPuzzlePlayMode, PieceCount } from './play-modes/JigsawPuzzlePlayMode.tsx';
import { TeamBattlePlayMode } from './play-modes/TeamBattlePlayMode.tsx';
import { GameType } from '../types.ts';

interface ToddlerPlayAreaProps {
  game: TopicGame;
  settings: PreschoolSettings;
  activeChild?: ChildProfile | null;
  onOpenTeacherStudio: () => void;
  onOpenTopicSelector: () => void;
  onUpdateGame?: (updated: TopicGame) => void;
  onUpdateSettings?: (settings: PreschoolSettings) => void;
  onExitToDashboard?: () => void;
}

export const ToddlerPlayArea: React.FC<ToddlerPlayAreaProps> = ({
  game,
  settings,
  activeChild,
  onOpenTeacherStudio,
  onOpenTopicSelector,
  onUpdateSettings,
  onExitToDashboard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayChoices, setDisplayChoices] = useState<TopicItem[]>([]);
  const [correctItem, setCorrectItem] = useState<TopicItem | null>(null);
  const [wobbleId, setWobbleId] = useState<string | null>(null);
  const [selectedCorrectId, setSelectedCorrectId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [starsWon, setStarsWon] = useState<number[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCelebrationBanner, setShowCelebrationBanner] = useState(false);
  const [choicesCount, setChoicesCount] = useState<2 | 3>(game.choicesCount || 3);
  const [activeGameType, setActiveGameType] = useState<GameType>(game.gameType || 'listen_find');
  const [puzzlePieceCount, setPuzzlePieceCount] = useState<PieceCount>(game.puzzlePieces || 4);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);

  // Sync mode when game changes
  useEffect(() => {
    setActiveGameType(game.gameType || 'listen_find');
    setPuzzlePieceCount(game.puzzlePieces || 4);
    setTeam1Score(0);
    setTeam2Score(0);
  }, [game.id, game.gameType, game.puzzlePieces]);

  // 'Who Disappeared?' game type state
  const [isHidingStage, setIsHidingStage] = useState(false);
  const [hiddenItemId, setHiddenItemId] = useState<string | null>(null);

  // Repetition state for 'Topic Practice Mode'
  const [currentRep, setCurrentRep] = useState(1);
  const [totalPlayCount, setTotalPlayCount] = useState(1);
  const [showHintPulse, setShowHintPulse] = useState(false);
  const [isWaitingForNextRep, setIsWaitingForNextRep] = useState(false);
  const repeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedCorrectRef = useRef<string | null>(null);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Play question prompt with automatic repetitions based on practice settings
  const startPromptRepetitions = useCallback(
    (targetItem: TopicItem, startRep: number = 1) => {
      if (repeatTimerRef.current) {
        clearTimeout(repeatTimerRef.current);
        repeatTimerRef.current = null;
      }

      const totalReps = (settings.topicPracticeMode ?? true)
        ? (settings.audioPromptRepetitions || 2)
        : 1;

      const playRep = (rep: number) => {
        if (selectedCorrectRef.current) return;

        setCurrentRep(rep);
        setTotalPlayCount(rep);
        setIsWaitingForNextRep(false);
        setIsSpeaking(true);

        // If this is the second time or later that the audio plays, activate the gentle glowing hint pulse!
        if (rep >= 2 && (settings.enableVisualHintAfterRepeat ?? true)) {
          setShowHintPulse(true);
        }

        const promptText =
          game.gameType === 'touch_explore'
            ? targetItem.readingSentence || targetItem.questionText
            : targetItem.questionText;

        audioEngine.playQuestion(promptText, targetItem.audioUrl, {
          targetName: targetItem.name,
          onEnd: () => {
            setIsSpeaking(false);
            if (selectedCorrectRef.current) return;

            if (rep >= 2 && (settings.enableVisualHintAfterRepeat ?? true)) {
              setShowHintPulse(true);
            }

            if (rep < totalReps) {
              setIsWaitingForNextRep(true);
              const intervalMs = (settings.repetitionIntervalSeconds || 3) * 1000;
              repeatTimerRef.current = setTimeout(() => {
                repeatTimerRef.current = null;
                if (!selectedCorrectRef.current) {
                  playRep(rep + 1);
                }
              }, intervalMs);
            } else {
              setIsWaitingForNextRep(false);
            }
          },
        });
      };

      playRep(startRep);
    },
    [settings.topicPracticeMode, settings.audioPromptRepetitions, settings.repetitionIntervalSeconds, settings.enableVisualHintAfterRepeat, game.gameType]
  );

  // Setup round
  const setupRound = useCallback((index: number) => {
    if (!game.items || game.items.length === 0) return;

    if (repeatTimerRef.current) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }

    if (index >= game.items.length) {
      setIsCompleted(true);
      recordTopicCompleted(game.id, game.title);
      fireBigVictoryCelebration();
      audioEngine.playPraise();
      return;
    }

    const target = game.items[index];
    setCorrectItem(target);
    selectedCorrectRef.current = null;
    setSelectedCorrectId(null);
    setWobbleId(null);
    setShowCelebrationBanner(false);
    setCurrentRep(1);
    setTotalPlayCount(1);
    setShowHintPulse(false);
    setIsWaitingForNextRep(false);

    // Pick distractors: ensure they are distinct in name from target item
    const otherDistinctItems = game.items.filter(
      (it) => it.id !== target.id && it.name.trim().toLowerCase() !== target.name.trim().toLowerCase()
    );
    const shuffledOthers = [...otherDistinctItems].sort(() => Math.random() - 0.5);
    const targetDistractorCount = choicesCount === 2 ? 1 : 2;

    let roundDistractors: TopicItem[] = shuffledOthers.slice(0, targetDistractorCount);

    // If game items are all on the same subject (e.g. Quả Cà Chua), pull distinct distractors from preschool library
    if (roundDistractors.length < targetDistractorCount) {
      const extraNeeded = targetDistractorCount - roundDistractors.length;
      const extras = getFallbackDistractors(target.name, extraNeeded);
      roundDistractors = [...roundDistractors, ...(extras as TopicItem[])];
    }

    const roundChoices = [target, ...roundDistractors].sort(() => Math.random() - 0.5);
    setDisplayChoices(roundChoices);

    // If 'Who Disappeared?', initiate peek-a-boo hiding sequence
    if (game.gameType === 'who_disappeared') {
      setIsHidingStage(false);
      setHiddenItemId(null);
      // Show all cards for 2.5s, then hide target
      setTimeout(() => {
        setIsHidingStage(true);
        setHiddenItemId(target.id);
        startPromptRepetitions(target, 1);
      }, 2500);
    } else {
      // Automatically prompt with sound and configured repetitions
      startPromptRepetitions(target, 1);
    }
  }, [game.items, game.gameType, choicesCount, startPromptRepetitions]);

  // Initial load or topic change
  useEffect(() => {
    setCurrentIndex(0);
    setIsCompleted(false);
    setStarsWon([]);
    setupRound(0);

    return () => {
      if (repeatTimerRef.current) {
        clearTimeout(repeatTimerRef.current);
        repeatTimerRef.current = null;
      }
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
      audioEngine.stopAll();
    };
  }, [game.id, setupRound]);

  // Replay question audio
  const handleReplayAudio = () => {
    if (!correctItem) return;
    hapticsEngine.triggerTap(settings.enableHaptics ?? true);
    audioEngine.playPop();

    const nextCount = totalPlayCount + 1;
    setTotalPlayCount(nextCount);

    if (nextCount >= 2 && (settings.enableVisualHintAfterRepeat ?? true)) {
      setShowHintPulse(true);
    }

    startPromptRepetitions(correctItem, nextCount);
  };

  // Next question
  const handleNext = () => {
    hapticsEngine.triggerTap(settings.enableHaptics ?? true);
    setShowHintPulse(false);
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    setupRound(nextIdx);
  };

  // Restart game
  const handleRestart = () => {
    hapticsEngine.triggerTap(settings.enableHaptics ?? true);
    setShowHintPulse(false);
    setCurrentIndex(0);
    setIsCompleted(false);
    setStarsWon([]);
    setupRound(0);
  };

  // Toddler card click handler
  const handleCardClick = (item: TopicItem) => {
    if (selectedCorrectId || !correctItem) return;

    audioEngine.playPop();
    const enableHaptics = settings.enableHaptics ?? true;

    // Stop repetitions
    if (repeatTimerRef.current) {
      clearTimeout(repeatTimerRef.current);
      repeatTimerRef.current = null;
    }
    setIsWaitingForNextRep(false);

    // MODE: Touch to Explore
    if (game.gameType === 'touch_explore') {
      audioEngine.stopAll();
      hapticsEngine.triggerTap(enableHaptics);
      audioEngine.speakVietnamese(`${item.name}. ${item.soundText}`);
      setSelectedCorrectId(item.id);
      setTimeout(() => setSelectedCorrectId(null), 1500);
      return;
    }

    // CHECK CORRECT ANSWER
    if (item.id === correctItem.id) {
      selectedCorrectRef.current = item.id;
      audioEngine.stopAll();
      setShowHintPulse(false);

      // Record child activity if active child selected
      if (activeChild) {
        recordChildActivityResult({
          childId: activeChild.id,
          childName: activeChild.fullName,
          gameId: game.id,
          gameTitle: game.title,
          gameType: game.gameType,
          correctCount: 1,
          attemptCount: 1,
          supportCount: showHintPulse ? 1 : 0,
          durationSeconds: 15,
          skillsDemonstrated: ['Nhận biết âm thanh & hình ảnh', 'Phản xạ tay - mắt'],
          playedAt: Date.now(),
        });
      }

      // Track progress
      recordTopicAttempt(game.id, game.title, item.id, item.name, true);

      // Tactile celebratory pulse
      hapticsEngine.triggerSuccess(enableHaptics);

      setSelectedCorrectId(item.id);
      setShowCelebrationBanner(true);
      setStarsWon((prev) => [...prev, currentIndex]);

      const customPraise = correctItem.praisePhrase || item.praiseAudioUrl;
      audioEngine.playPraise(customPraise);

      // Auto advance
      if (settings.autoAdvanceSeconds > 0) {
        autoAdvanceTimerRef.current = setTimeout(() => {
          handleNext();
        }, settings.autoAdvanceSeconds * 1000);
      }
    } else {
      // Track wrong attempt
      recordTopicAttempt(game.id, game.title, item.id, item.name, false);

      hapticsEngine.triggerWrong(enableHaptics);

      setWobbleId(item.id);
      const customEncourage = correctItem.encouragementPhrase;
      if (customEncourage) {
        audioEngine.speakVietnamese(customEncourage);
      } else {
        audioEngine.playEncouragement();
      }

      setTimeout(() => {
        setWobbleId(null);
      }, 600);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const isTouchTV = settings.touchTVMode;

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-b from-sky-100/70 via-amber-50/50 to-emerald-50/60 p-3 sm:p-6 touch-manipulation select-none">
      {/* Background preschool bubbles */}
      <div className="absolute top-6 left-8 w-24 h-14 bg-white/70 rounded-full blur-[1px] pointer-events-none -z-10" />
      <div className="absolute top-12 left-16 w-32 h-16 bg-white/80 rounded-full blur-[1px] pointer-events-none -z-10" />
      <div className="absolute top-8 right-12 w-28 h-14 bg-white/70 rounded-full blur-[1px] pointer-events-none -z-10" />
      <div className="absolute bottom-16 left-12 w-20 h-20 bg-amber-200/30 rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-24 right-16 w-28 h-28 bg-emerald-200/30 rounded-full pointer-events-none -z-10" />

      {/* REWARD OVERLAY FOR TODDLER CELEBRATION */}
      <RewardOverlay
        show={selectedCorrectId !== null && !isCompleted}
        message="GIỎI QUÁ! BÉ ĐÚNG RỒI!"
        itemName={correctItem?.name}
        enableSound={settings.enableSoundEffects ?? true}
        enableConfetti={true}
      />

      {/* TOP HEADER BAR */}
      <header className="flex items-center justify-between gap-2 max-w-5xl mx-auto w-full pt-1 pb-2">
        <div className="flex items-center gap-2">
          {/* Back to Teacher Dashboard */}
          {onExitToDashboard && (
            <button
              onClick={onExitToDashboard}
              className="px-3.5 py-2.5 bg-white/90 hover:bg-white text-slate-800 rounded-2xl shadow-xs border-2 border-slate-200 active:scale-95 transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer"
              title="Quay lại góc giáo viên"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Góc Giáo Viên</span>
            </button>
          )}

          {/* Topic Title & Switcher */}
          <button
            onClick={onOpenTopicSelector}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white/90 hover:bg-white text-slate-800 rounded-2xl shadow-xs border-2 border-amber-200/80 active:scale-95 transition-all text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center text-white text-base font-black shadow-xs">
              🌟
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Chủ đề đang chơi:
              </div>
              <div className="font-extrabold text-sm text-slate-900 line-clamp-1">
                {game.title}
              </div>
            </div>
          </button>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2">
          {/* Active Child Indicator */}
          {activeChild && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 border border-pink-300 rounded-2xl text-xs font-bold text-pink-950">
              <span>{activeChild.avatarEmoji}</span>
              <span>{activeChild.fullName}</span>
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="w-11 h-11 bg-white/90 hover:bg-white text-slate-700 rounded-2xl border-2 border-slate-200 shadow-2xs flex items-center justify-center active:scale-95 transition-all cursor-pointer"
            aria-label="Toàn màn hình"
            title="Toàn màn hình TV / Tablet"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* Teacher Studio Button */}
          <button
            onClick={onOpenTeacherStudio}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs sm:text-sm rounded-2xl border-2 border-amber-500/80 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Quản Lý Bài</span>
          </button>
        </div>
      </header>

      {/* 2. PRESCHOOL GAME MODE SWITCHER BAR */}
      <div className="w-full max-w-4xl mx-auto px-2 mb-2 flex items-center justify-center">
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-white/95 rounded-2xl border-2 border-amber-200/90 shadow-xs">
          <span className="text-[11px] font-black uppercase text-amber-900 px-2 flex items-center gap-1">
            <span>🎮</span>
            <span className="hidden sm:inline">Cách chơi:</span>
          </span>

          <button
            type="button"
            onClick={() => {
              setActiveGameType('listen_find');
              audioEngine.playPop();
            }}
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
              activeGameType === 'listen_find'
                ? 'bg-amber-400 text-amber-950 shadow-xs ring-2 ring-amber-300'
                : 'text-slate-600 hover:bg-amber-50 hover:text-amber-900'
            }`}
          >
            <span>🔍</span>
            <span>Nghe & Tìm</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveGameType('drag_drop');
              audioEngine.playPop();
            }}
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
              activeGameType === 'drag_drop'
                ? 'bg-emerald-500 text-white shadow-xs ring-2 ring-emerald-300'
                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
            }`}
          >
            <span>✋</span>
            <span>Kéo Thả</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveGameType('puzzle_jigsaw');
              audioEngine.playPop();
            }}
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
              activeGameType === 'puzzle_jigsaw'
                ? 'bg-purple-500 text-white shadow-xs ring-2 ring-purple-300'
                : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
            }`}
          >
            <span>🧩</span>
            <span>Ghép Tranh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveGameType('team_battle');
              audioEngine.playPop();
            }}
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
              activeGameType === 'team_battle'
                ? 'bg-rose-500 text-white shadow-xs ring-2 ring-rose-300'
                : 'text-slate-600 hover:bg-rose-50 hover:text-rose-900'
            }`}
          >
            <span>🏆</span>
            <span>Thi Đấu 2 Đội</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveGameType('who_disappeared');
              audioEngine.playPop();
            }}
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
              activeGameType === 'who_disappeared'
                ? 'bg-sky-500 text-white shadow-xs ring-2 ring-sky-300'
                : 'text-slate-600 hover:bg-sky-50 hover:text-sky-900'
            }`}
          >
            <span>🙈</span>
            <span className="hidden sm:inline">Ai Biến Mất</span>
          </button>
        </div>
      </div>

      {/* VICTORY OVERLAY WHEN GAME FINISHED */}
      {isCompleted ? (
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full text-center px-4 py-8 animate-in fade-in zoom-in duration-300">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 flex items-center justify-center text-5xl sm:text-6xl shadow-xl border-4 border-white mb-5 animate-joyful-bounce">
            🌟
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-amber-900 mb-2">
            Bé Giỏi Quá! Hoan Hô!
          </h2>
          <p className="text-lg sm:text-xl font-bold text-slate-700 mb-8 max-w-md">
            Con đã hoàn thành trò chơi &ldquo;{game.title}&rdquo; xuất sắc!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            <button
              onClick={handleRestart}
              className="flex-1 py-4 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-lg sm:text-xl rounded-3xl shadow-lg border-b-4 border-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-6 h-6" />
              Chơi Lại Nào
            </button>
            <button
              onClick={onOpenTopicSelector}
              className="flex-1 py-4 px-6 bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold text-lg sm:text-xl rounded-3xl shadow-lg border-b-4 border-amber-600 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-6 h-6" />
              Đổi Chủ Đề
            </button>
          </div>
        </div>
      ) : (
        /* MAIN PLAYING AREA */
        <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full py-2 sm:py-4">
          {/* MODE 1: DRAG & DROP MODE */}
          {activeGameType === 'drag_drop' && correctItem ? (
            <div className="w-full flex flex-col items-center">
              {/* Question card */}
              <div className="w-full flex flex-col items-center mb-3">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/95 rounded-3xl border-3 border-emerald-300 shadow-md">
                  <button
                    onClick={handleReplayAudio}
                    className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center active:scale-90 shadow-sm cursor-pointer"
                    title="Nghe lại"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                  <div className="text-left">
                    <div className="text-xs font-bold uppercase text-emerald-800 tracking-wider">
                      Bé kéo thả vào bóng tương ứng nhé:
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">
                      {stripSSML(correctItem.questionText)}
                    </div>
                  </div>
                </div>
              </div>

              <DragDropPlayMode
                targetItem={correctItem}
                displayChoices={displayChoices}
                onCorrectDrop={() => handleCardClick(correctItem)}
                onWrongDrop={(it) => handleCardClick(it)}
                showHint={showHintPulse}
                enableHaptics={settings.enableHaptics ?? true}
              />
            </div>
          ) : activeGameType === 'puzzle_jigsaw' && correctItem ? (
            /* MODE 2: JIGSAW PUZZLE MODE */
            <div className="w-full flex flex-col items-center">
              {/* Question card */}
              <div className="w-full flex flex-col items-center mb-2">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/95 rounded-3xl border-3 border-purple-300 shadow-md">
                  <button
                    onClick={handleReplayAudio}
                    className="w-11 h-11 rounded-full bg-purple-500 text-white flex items-center justify-center active:scale-90 shadow-sm cursor-pointer"
                    title="Nghe lại"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <div className="text-left">
                    <div className="text-xs font-bold uppercase text-purple-800 tracking-wider">
                      Bé cùng cô ghép bức tranh này nhé:
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-slate-900">
                      {correctItem.name}
                    </div>
                  </div>
                </div>
              </div>

              <JigsawPuzzlePlayMode
                targetItem={correctItem}
                initialPieceCount={puzzlePieceCount}
                onCompleted={() => handleCardClick(correctItem)}
                enableHaptics={settings.enableHaptics ?? true}
              />
            </div>
          ) : activeGameType === 'team_battle' && correctItem ? (
            /* MODE 3: 2-TEAM BATTLE MODE */
            <div className="w-full flex flex-col items-center">
              {/* Question card */}
              <div className="w-full flex flex-col items-center mb-2">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/95 rounded-3xl border-3 border-rose-300 shadow-md">
                  <button
                    onClick={handleReplayAudio}
                    className="w-11 h-11 rounded-full bg-rose-500 text-white flex items-center justify-center active:scale-90 shadow-sm cursor-pointer"
                    title="Nghe lại"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <div className="text-left">
                    <div className="text-xs font-bold uppercase text-rose-800 tracking-wider">
                      Hai đội sẵn sàng: Ai chạm đúng trước sẽ ghi điểm!
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-slate-900">
                      {stripSSML(correctItem.questionText)}
                    </div>
                  </div>
                </div>
              </div>

              <TeamBattlePlayMode
                targetItem={correctItem}
                displayChoices={displayChoices}
                team1Score={team1Score}
                team2Score={team2Score}
                onTeamWinRound={(winningTeam) => {
                  if (winningTeam === 'red') {
                    setTeam1Score((s) => s + 1);
                  } else {
                    setTeam2Score((s) => s + 1);
                  }
                  handleCardClick(correctItem);
                }}
                onResetScore={() => {
                  setTeam1Score(0);
                  setTeam2Score(0);
                }}
                enableHaptics={settings.enableHaptics ?? true}
              />
            </div>
          ) : (
            /* DEFAULT / STANDARD CARDS MODE (LISTEN & FIND, TOUCH & EXPLORE, WHO DISAPPEARED) */
            <>
              {/* SPECIAL TOP TARGET FOR 'MATCH SIMILAR' */}
              {game.gameType === 'match_similar' && correctItem && (
                <div className="mb-4 text-center space-y-2 animate-in fade-in duration-200">
                  <span className="text-xs font-black uppercase text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                    Hình mẫu cần tìm:
                  </span>
                  <div
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-3 mx-auto border-4 border-amber-400 shadow-md flex items-center justify-center"
                    style={{ backgroundColor: correctItem.bgColor || '#FEF3C7' }}
                  >
                    <img src={correctItem.imageUrl} alt={correctItem.name} className="w-full h-full object-contain" />
                  </div>
                </div>
              )}

              {/* QUESTION PROMPT CARD & BIG REPLAY BUTTON */}
              <div className="w-full flex flex-col items-center mb-4 sm:mb-6">
                <div className="relative inline-flex items-center gap-3 sm:gap-5 px-6 sm:px-8 py-3.5 sm:py-4 bg-white/95 rounded-3xl border-3 border-amber-300/80 shadow-md">
                  {/* Speaker / Replay Button */}
                  <button
                    onClick={handleReplayAudio}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-md cursor-pointer ${
                      isSpeaking
                        ? 'bg-amber-500 text-white ring-8 ring-amber-300/60 animate-pulse'
                        : 'bg-amber-400 hover:bg-amber-500 text-amber-950'
                    }`}
                    aria-label="Nghe lại câu hỏi"
                  >
                    <Volume2 className="w-8 h-8 sm:w-10 sm:h-10" />
                    {isSpeaking && (
                      <span className="absolute -inset-2 rounded-full border-4 border-amber-400/80 animate-ping pointer-events-none" />
                    )}
                  </button>

                  <div className="text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-800">
                        Bé nghe cô hỏi nhé:
                      </span>
                      {(settings.topicPracticeMode ?? true) && (settings.audioPromptRepetitions || 2) > 1 && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 border border-amber-300 text-amber-950 flex items-center gap-1.5 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span>Luyện tập: Lần {currentRep}/{settings.audioPromptRepetitions || 2}</span>
                          {isWaitingForNextRep && (
                            <span className="text-amber-700 font-semibold text-[10px]">
                              (Đợi bé {settings.repetitionIntervalSeconds || 3}s...)
                            </span>
                          )}
                        </span>
                      )}
                      {showHintPulse && !selectedCorrectId && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-200 border border-amber-400 text-amber-950 flex items-center gap-1 shadow-2xs animate-pulse">
                          <span>✨</span>
                          <span>Gợi ý viền sáng đang bật</span>
                        </span>
                      )}
                      <button
                        onClick={handleReplayAudio}
                        className="text-xs font-bold text-amber-900 underline hover:text-amber-950 cursor-pointer ml-auto sm:ml-0"
                      >
                        (Nghe lại 🔊)
                      </button>
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                      {correctItem ? stripSSML(correctItem.questionText) : 'Bé chạm vào hình đúng nhé!'}
                    </div>
                  </div>
                </div>

                {/* MOVEMENT SUGGESTION BANNER FOR TEACHER & TODDLER */}
                {correctItem?.movementSuggestion && !showCelebrationBanner && (
                  <div className="mt-2.5 px-4 py-1.5 bg-emerald-100/90 text-emerald-950 rounded-full font-bold text-xs sm:text-sm border border-emerald-300 flex items-center gap-1.5 shadow-2xs animate-in fade-in duration-300">
                    <span>🤸</span>
                    <span>
                      <strong>Cùng cô vận động: </strong>
                      {correctItem.movementSuggestion}
                    </span>
                  </div>
                )}

                {/* Praise banner when chosen correctly */}
                {showCelebrationBanner && (
                  <div className="mt-3 px-6 py-2 bg-emerald-500 text-white rounded-full font-black text-lg sm:text-2xl shadow-lg border-2 border-emerald-300 animate-joyful-bounce flex items-center gap-2">
                    <span>🌟</span>
                    <span>GIỎI QUÁ! BÉ ĐÚNG RỒI!</span>
                    <span>🎉</span>
                  </div>
                )}
              </div>

              {/* 2 OR 3 LARGE ILLUSTRATED CARDS */}
              <div
                className={`w-full grid gap-4 sm:gap-8 px-2 max-w-4xl mx-auto items-stretch ${
                  displayChoices.length === 2
                    ? 'grid-cols-2 max-w-2xl'
                    : 'grid-cols-1 sm:grid-cols-3'
                }`}
              >
                {displayChoices.map((item) => {
                  const isWobbling = wobbleId === item.id;
                  const isCorrectSelection = selectedCorrectId === item.id;
                  const isHintActive =
                    showHintPulse &&
                    item.id === correctItem?.id &&
                    !selectedCorrectId;

                  // Hide card if in 'Who Disappeared?' peek-a-boo hiding stage
                  const isHiddenCard =
                    game.gameType === 'who_disappeared' &&
                    isHidingStage &&
                    hiddenItemId === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleCardClick(item)}
                      disabled={selectedCorrectId !== null}
                      className={`group relative flex flex-col items-center justify-between p-4 sm:p-6 rounded-4xl sm:rounded-5xl transition-all duration-300 cursor-pointer select-none active:scale-95 touch-manipulation border-4 sm:border-6 ${
                        game.gameType === 'knowledge_bubbles'
                          ? 'rounded-full aspect-square border-amber-300/80 shadow-2xl hover:scale-105'
                          : ''
                      } ${
                        isCorrectSelection
                          ? 'bg-emerald-100 border-emerald-500 ring-8 ring-emerald-300/60 shadow-2xl scale-105 animate-joyful-bounce z-20'
                          : isWobbling
                          ? 'bg-rose-50 border-rose-300 shadow-md animate-gentle-wobble'
                          : isHintActive
                          ? 'bg-amber-50/95 border-amber-400 ring-8 ring-amber-300/80 shadow-[0_0_35px_rgba(251,191,36,0.65)] scale-[1.03] animate-pulse z-10'
                          : 'bg-white hover:bg-amber-50/70 border-white hover:border-amber-200 shadow-xl hover:shadow-2xl'
                      }`}
                      style={{
                        minHeight: '260px',
                        maxHeight: '440px',
                      }}
                      aria-label={item.name}
                    >
                      {/* Glowing hint ripple beacon when repeated */}
                      {isHintActive && (
                        <>
                          <span className="absolute -inset-3 rounded-4xl sm:rounded-5xl border-4 border-amber-400/70 animate-ping pointer-events-none" />
                          <div className="absolute -top-3.5 -right-2 sm:-right-3 z-30 px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-black text-xs sm:text-sm rounded-full shadow-md border-2 border-white flex items-center gap-1.5 animate-bounce">
                            <Sparkles className="w-3.5 h-3.5 text-amber-950 fill-amber-500" />
                            <span>Đáp án nè bé! ✨</span>
                          </div>
                        </>
                      )}

                      {/* Peek-a-boo curtain for 'Who Disappeared?' */}
                      {isHiddenCard ? (
                        <div className="w-full flex-1 rounded-3xl bg-amber-200/80 border-2 border-dashed border-amber-400 flex flex-col items-center justify-center p-4">
                          <span className="text-5xl animate-bounce">❓</span>
                          <span className="text-xs font-black text-amber-900 mt-2">Ai biến mất rồi?</span>
                        </div>
                      ) : (
                        /* Subtle inner colored backdrop */
                        <div
                          className="w-full flex-1 rounded-3xl flex items-center justify-center p-3 sm:p-5 relative overflow-hidden"
                          style={{ backgroundColor: item.bgColor || '#FFFBEB' }}
                        >
                          {isHintActive && (
                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-300/25 via-yellow-200/15 to-transparent pointer-events-none rounded-3xl animate-pulse" />
                          )}

                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className={`w-full h-full max-h-56 sm:max-h-64 object-contain transition-transform duration-200 pointer-events-none drop-shadow-md ${
                              isHintActive ? 'scale-105' : 'group-hover:scale-105'
                            }`}
                          />

                          {isCorrectSelection && (
                            <div className="absolute inset-0 flex items-center justify-center bg-emerald-400/20 backdrop-blur-2xs">
                              <span className="text-6xl sm:text-7xl animate-bounce">⭐</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Clean text label at bottom */}
                      <div className="mt-3 sm:mt-4 text-center">
                        <span
                          className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-wide ${
                            isHintActive ? 'text-amber-950 font-black' : 'text-slate-800'
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.soundText && (
                          <span className="block text-sm sm:text-base font-bold text-amber-700/80 mt-0.5">
                            {item.soundText}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </main>
      )}

      {/* FOOTER CONTROLS */}
      <footer className="max-w-5xl mx-auto w-full flex items-center justify-between gap-3 pt-3 pb-1">
        {/* Replay voice button for little toddler fingers */}
        <button
          onClick={handleReplayAudio}
          className="flex items-center gap-2 px-5 py-3 bg-white/90 hover:bg-white text-slate-800 rounded-3xl border-2 border-amber-200 shadow-xs active:scale-95 transition-all text-base font-bold cursor-pointer"
        >
          <Volume2 className="w-5 h-5 text-amber-600" />
          <span>Nghe lại</span>
        </button>

        {/* Progress dots for current round */}
        <div className="text-sm font-black text-slate-500 bg-white/70 px-4 py-2 rounded-full border border-slate-200">
          Câu {Math.min(currentIndex + 1, game.items.length)} / {game.items.length}
        </div>

        {/* Next question button */}
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base sm:text-lg rounded-3xl shadow-md border-b-4 border-emerald-700 active:scale-95 transition-all cursor-pointer"
        >
          <span>Câu tiếp theo</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
};
