import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Home,
  RotateCcw,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { TOPIC_CATEGORIES, TopicCategory, TopicItemData } from '../data/topics.ts';
import { ProgressBar } from './ProgressBar.tsx';
import { AudioButton } from './AudioButton.tsx';
import { GameCard } from './GameCard.tsx';
import { ResultScreen } from './ResultScreen.tsx';
import { saveSessionHistoryRecord } from './HistoryScreen.tsx';
import { audioEngine } from '../utils/audio.ts';
import { hapticsEngine } from '../utils/haptics.ts';

export type PlayGameMode =
  | 'listen_find' // 🎧 Nghe và tìm: "Con mèo đâu?"
  | 'sound_guess' // 🔊 Nghe tiếng đoán con vật: "Meo meo"
  | 'touch_request' // 👆 Tìm theo yêu cầu: "Hãy tìm quả chuối"
  | 'imitation'; // 🗣️ Nghe và bắt chước: "Con nói: Mèo" -> Sau đó hiện "➡ Tiếp theo"

interface GameScreenProps {
  topicId: string;
  gameMode: PlayGameMode;
  questionCount: number; // 5 | 10 | 15
  difficulty: 'easy' | 'medium' | 'hard'; // 2 | 3 | 4
  soundEnabled: boolean;
  shuffleChoices?: boolean;
  onGoHome: () => void;
  onChangeTopic: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  topicId,
  gameMode,
  questionCount,
  difficulty,
  soundEnabled: initialSoundEnabled,
  shuffleChoices = true,
  onGoHome,
  onChangeTopic,
}) => {
  const category =
    TOPIC_CATEGORIES.find((t) => t.id === topicId) || TOPIC_CATEGORIES[0];

  // Number of cards per question
  const choicesCount: 2 | 3 | 4 =
    difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;

  // Sound toggle
  const [isSoundOn, setIsSoundOn] = useState(initialSoundEnabled);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Question session state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctScore, setCorrectScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Time tracking
  const [startTime] = useState<number>(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Round choices and target
  const [roundTarget, setRoundTarget] = useState<TopicItemData>(category.items[0]);
  const [roundChoices, setRoundChoices] = useState<TopicItemData[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Record<string, 'idle' | 'correct' | 'wrong'>>({});
  const [isCardLocked, setIsCardLocked] = useState(false);

  // Imitation mode button visibility
  const [showNextButton, setShowNextButton] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Setup current round choices & prompt
  const setupRound = (index: number) => {
    if (category.items.length === 0) return;

    // Pick target item
    const target = category.items[index % category.items.length];
    setRoundTarget(target);

    // Pick distractors from the same category or all categories
    const otherItems = category.items.filter((it) => it.id !== target.id);
    // Shuffle other items
    const shuffledOthers = [...otherItems].sort(() => Math.random() - 0.5);

    // If not enough items in same category, borrow from other categories
    let pool = shuffledOthers;
    if (pool.length < choicesCount - 1) {
      const allOtherItems = TOPIC_CATEGORIES.flatMap((c) => c.items).filter(
        (it) => it.id !== target.id && !pool.some((p) => p.id === it.id)
      );
      pool = [...pool, ...allOtherItems.sort(() => Math.random() - 0.5)];
    }

    const distractors = pool.slice(0, choicesCount - 1);
    let combined = [target, ...distractors];

    // Thực hiện shuffle mảng choices trước khi render nếu bật xáo trộn
    if (shuffleChoices) {
      // Fisher-Yates algorithm for uniform random distribution
      for (let i = combined.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combined[i], combined[j]] = [combined[j], combined[i]];
      }
    }

    setRoundChoices(combined);
    setSelectedStatus({});
    setIsCardLocked(false);
    setShowNextButton(false);

    // Formulate spoken prompt according to game mode
    let spokenText = '';
    if (gameMode === 'listen_find') {
      spokenText = target.questionText || `${target.name} đâu con nhỉ?`;
    } else if (gameMode === 'sound_guess') {
      spokenText = target.soundQuestionText || `${target.soundText}. Con gì kêu thế nhỉ?`;
    } else if (gameMode === 'touch_request') {
      spokenText = `Hãy tìm ${target.name.toLowerCase()} nào!`;
    } else if (gameMode === 'imitation') {
      spokenText = target.imitationPrompt || `Con nói: ${target.name}`;
      // After 2.5s show the Next button
      setTimeout(() => {
        setShowNextButton(true);
      }, 2500);
    }

    if (isSoundOn) {
      // Small pause before speaking
      setTimeout(() => {
        audioEngine.stopAll();
        audioEngine.speak(spokenText, { rate: 0.88 });
      }, 400);
    }
  };

  // Initialize round on index change
  useEffect(() => {
    setupRound(currentIndex);
  }, [currentIndex]);

  // Current prompt text for display and audio replay
  const getCurrentPromptText = (): string => {
    if (gameMode === 'listen_find') {
      return roundTarget.questionText || `${roundTarget.name} đâu?`;
    }
    if (gameMode === 'sound_guess') {
      return roundTarget.soundQuestionText || `Tiếng "${roundTarget.soundText}" là của ai?`;
    }
    if (gameMode === 'touch_request') {
      return `Hãy tìm ${roundTarget.name.toLowerCase()}`;
    }
    if (gameMode === 'imitation') {
      return roundTarget.imitationPrompt || `Con nói: ${roundTarget.name}`;
    }
    return roundTarget.questionText;
  };

  // Handle toddler card selection
  const handleCardSelect = (item: TopicItemData) => {
    if (isCardLocked) return;

    if (item.id === roundTarget.id) {
      // CORRECT CHOICE!
      setIsCardLocked(true);
      setSelectedStatus((prev) => ({ ...prev, [item.id]: 'correct' }));
      setCorrectScore((s) => s + 1);

      hapticsEngine.triggerSuccess(true);

      // Play soft reward sounds and cheerful female voice
      if (isSoundOn) {
        audioEngine.playSuccessChime();
        const praisePhrases = [
          'Đúng rồi!',
          'Giỏi quá!',
          'Con làm tốt lắm!',
          'Hoan hô con!',
          'Bé thông minh quá!',
        ];
        const randomPraise =
          praisePhrases[Math.floor(Math.random() * praisePhrases.length)];

        setTimeout(() => {
          audioEngine.speak(randomPraise, { rate: 0.88 });
        }, 300);
      }

      // Confetti burst
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
        });
      } catch {
        // Ignore
      }

      // Auto advance after 1.2–1.4 seconds
      setTimeout(() => {
        advanceNextQuestion();
      }, 1300);
    } else {
      // WRONG CHOICE (Soft, gentle feedback, allow re-selection)
      setSelectedStatus((prev) => ({ ...prev, [item.id]: 'wrong' }));
      hapticsEngine.triggerWrong(true);

      if (isSoundOn) {
        audioEngine.playTryAgainChime();
        audioEngine.speak('Con thử lại nhé!', { rate: 0.88 });
      }

      // Remove wobble state after 600ms so toddler can tap again
      setTimeout(() => {
        setSelectedStatus((prev) => ({ ...prev, [item.id]: 'idle' }));
      }, 700);
    }
  };

  // Advance question or complete session
  const advanceNextQuestion = () => {
    if (currentIndex + 1 >= questionCount) {
      // Completed!
      const totalSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      setElapsedSeconds(totalSeconds);
      setIsCompleted(true);

      // Format date for history record
      const now = new Date();
      const dateFormatted = `${now.toLocaleDateString('vi-VN')} ${now
        .toLocaleTimeString('vi-VN')
        .slice(0, 5)}`;
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      const durationFormatted =
        mins > 0 ? `${mins}p ${secs}s` : `${secs}s`;

      const finalCorrect = correctScore + 1;
      const pct = Math.round((finalCorrect / questionCount) * 100);

      // Save to localStorage history (and auto syncs with Firebase)
      saveSessionHistoryRecord({
        id: `sess_${Date.now()}`,
        date: dateFormatted,
        topicName: category.name,
        difficulty:
          difficulty === 'easy'
            ? 'Dễ (2 hình)'
            : difficulty === 'medium'
            ? 'Trung bình (3 hình)'
            : 'Khó (4 hình)',
        totalQuestions: questionCount,
        correctCount: finalCorrect,
        percentage: pct,
        durationFormatted,
        timestamp: Date.now(),
      });
    } else {
      setCurrentIndex((idx) => idx + 1);
    }
  };

  // Restart session
  const handleRestart = () => {
    setCurrentIndex(0);
    setCorrectScore(0);
    setIsCompleted(false);
    setupRound(0);
  };

  // If completed, show ResultScreen
  if (isCompleted) {
    return (
      <ResultScreen
        totalQuestions={questionCount}
        correctCount={correctScore}
        durationSeconds={elapsedSeconds}
        topicName={category.name}
        onPlayAgain={handleRestart}
        onGoHome={onGoHome}
        onChangeTopic={onChangeTopic}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen bg-gradient-to-b from-amber-50/70 via-orange-50/40 to-yellow-50/70 p-3 sm:p-6 flex flex-col justify-between select-none"
    >
      {/* 1. TOP HEADER BAR: CONTROLS & PROGRESS */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between gap-3 mb-2 sm:mb-4">
        {/* Left: Home & Restart */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGoHome}
            className="p-3 sm:p-3.5 bg-white hover:bg-amber-100/60 rounded-2xl border-2 border-amber-200 text-amber-950 font-black shadow-xs active:scale-90 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Về trang chủ"
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
            <span className="hidden sm:inline text-xs sm:text-sm">Trang chủ</span>
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="p-3 sm:p-3.5 bg-white hover:bg-amber-100/60 rounded-2xl border-2 border-amber-200 text-amber-950 font-black shadow-xs active:scale-90 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Chơi lại từ đầu"
          >
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700" />
            <span className="hidden sm:inline text-xs sm:text-sm">Chơi lại</span>
          </button>
        </div>

        {/* Center: Progress Bar */}
        <div className="flex-1 px-2">
          <ProgressBar
            currentQuestion={currentIndex + 1}
            totalQuestions={questionCount}
            correctCount={correctScore}
          />
        </div>

        {/* Right: Sound & Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSoundOn(!isSoundOn)}
            className={`p-3 sm:p-3.5 rounded-2xl border-2 shadow-xs active:scale-90 transition-all flex items-center gap-1.5 cursor-pointer ${
              isSoundOn
                ? 'bg-amber-100 border-amber-300 text-amber-950'
                : 'bg-slate-100 border-slate-300 text-slate-500'
            }`}
            title={isSoundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {isSoundOn ? (
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-amber-800" />
            ) : (
              <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
            <span className="hidden sm:inline text-xs sm:text-sm">
              {isSoundOn ? 'Bật' : 'Tắt'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-3 sm:p-3.5 bg-white hover:bg-amber-100/60 rounded-2xl border-2 border-amber-200 text-amber-950 font-black shadow-xs active:scale-90 transition-all cursor-pointer"
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 sm:w-6 sm:h-6 text-amber-800" />
            ) : (
              <Maximize className="w-5 h-5 sm:w-6 sm:h-6 text-amber-800" />
            )}
          </button>
        </div>
      </header>

      {/* 2. MAIN CENTER AREA: QUESTION PROMPT & RE-LISTEN BUTTON */}
      <main className="w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center gap-4 sm:gap-6 my-2">
        {/* BIG SPOKEN PROMPT CARD */}
        <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl border-3 border-amber-300 shadow-md p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">{category.icon}</span>
            <div>
              <span className="text-xs font-black text-amber-800 uppercase tracking-wider block">
                {category.name}
              </span>
              <h1 className="text-xl sm:text-3xl font-black text-slate-800 tracking-tight leading-snug">
                {getCurrentPromptText()}
              </h1>
            </div>
          </div>

          {/* BIG RE-LISTEN BUTTON */}
          <AudioButton
            textToSpeak={getCurrentPromptText()}
            label="Nghe lại"
            size="lg"
            disabled={!isSoundOn}
          />
        </div>

        {/* 3. CARD GRID: 2, 3, OR 4 PICTURES */}
        {gameMode === 'imitation' ? (
          /* IMITATION MODE: SHOW SINGLE BIG PICTURE + 'TIẾP THEO' BUTTON */
          <div className="w-full max-w-md flex flex-col items-center justify-center gap-6 my-2 animate-fadeIn">
            <div
              style={{
                borderRadius: '28px',
                backgroundColor: roundTarget.bgColor || '#FFFBEB',
              }}
              className="w-full p-6 sm:p-8 border-4 border-amber-300 shadow-xl flex flex-col items-center justify-center text-center"
            >
              <img
                src={roundTarget.imageUrl}
                alt={roundTarget.name}
                className="w-48 h-48 sm:w-60 sm:h-60 object-contain drop-shadow-md mb-4"
              />
              <span className="px-6 py-2 bg-white/90 text-slate-900 font-black text-2xl sm:text-3xl rounded-2xl border-2 border-slate-200">
                {roundTarget.name}
              </span>
            </div>

            {/* Next Button after repeating */}
            {showNextButton && (
              <button
                type="button"
                onClick={advanceNextQuestion}
                className="w-full py-4 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xl sm:text-2xl rounded-3xl shadow-lg border-2 border-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer animate-bounce"
              >
                <span>Tiếp theo</span>
                <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}
          </div>
        ) : (
          /* STANDARD INTERACTIVE 2, 3, OR 4 CARDS GRID */
          <div
            className={`w-full grid gap-4 sm:gap-6 ${
              choicesCount === 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
                : choicesCount === 3
                ? 'grid-cols-1 sm:grid-cols-3 max-w-3xl'
                : 'grid-cols-2 sm:grid-cols-4 max-w-4xl'
            }`}
          >
            {roundChoices.map((choice) => (
              <GameCard
                key={choice.id}
                item={choice}
                isCorrectTarget={choice.id === roundTarget.id}
                status={selectedStatus[choice.id] || 'idle'}
                onSelect={handleCardSelect}
                disabled={isCardLocked}
                layoutCount={choicesCount}
              />
            ))}
          </div>
        )}
      </main>

      {/* 4. BOTTOM HELPER NOTE (Gentle encouragement) */}
      <footer className="w-full max-w-4xl mx-auto text-center pt-2">
        <span className="text-xs sm:text-sm font-bold text-amber-800/80 inline-flex items-center gap-1.5 bg-amber-100/50 px-3.5 py-1 rounded-full">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Bé chạm vào hình để trả lời cô nhé!</span>
        </span>
      </footer>
    </div>
  );
};
