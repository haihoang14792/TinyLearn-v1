import React, { useState, useEffect } from 'react';
import {
  TopicGame,
  PreschoolSettings,
  LessonPlan,
  ChildProfile,
  ChildActivityResult,
  MediaItem,
  TopicProgressStat,
} from './types.ts';
import {
  loadStoredGames,
  saveStoredGames,
  loadStoredSettings,
  saveStoredSettings,
  loadStoredLessonPlans,
  saveStoredLessonPlans,
  saveSingleLessonPlan,
  loadStoredChildren,
  saveStoredChildren,
  loadStoredActivityResults,
  loadStoredMedia,
  saveStoredMedia,
  loadProgressStats,
  exportGamesToJson,
  importGamesFromJsonFile,
} from './utils/storage.ts';
import { DEFAULT_GAMES } from './data/defaultTopics.ts';
import { audioEngine } from './utils/audio.ts';

// Components
import { TeacherDashboard } from './components/TeacherDashboard.tsx';
import { ToddlerPlayArea } from './components/ToddlerPlayArea.tsx';
import { AIGameBuilderModal } from './components/AIGameBuilderModal.tsx';
import { LessonPlanModal } from './components/LessonPlanModal.tsx';
import { ChildrenManagerModal } from './components/ChildrenManagerModal.tsx';
import { ReportsModal } from './components/ReportsModal.tsx';
import { MediaLibraryModal } from './components/MediaLibraryModal.tsx';
import { QRCodeModal } from './components/QRCodeModal.tsx';
import { TopicSelectorModal } from './components/TopicSelectorModal.tsx';
import { TeacherStudio } from './components/TeacherStudio.tsx';
import { ChildLockModal } from './components/ChildLockModal.tsx';
import { HomePage } from './components/HomePage.tsx';
import { TeacherSetup } from './components/TeacherSetup.tsx';
import { GameScreen, PlayGameMode } from './components/GameScreen.tsx';
import { TeacherPedagogyHub } from './components/pedagogy/TeacherPedagogyHub.tsx';
import { ToddlerActivityCanvas } from './components/pedagogy/ToddlerActivityCanvas.tsx';
import { ObservationForm } from './components/pedagogy/ObservationForm.tsx';
import { PreschoolActivity } from './data/activityTypes.ts';
import { ACTIVITIES_12_18 } from './data/activities-12-18.ts';
import { ACTIVITIES_18_24 } from './data/activities-18-24.ts';

export default function App() {
  // Main view state
  const [currentView, setCurrentView] = useState<
    | 'home'
    | 'teacher_pedagogy'
    | 'pedagogy_activity'
    | 'pedagogy_observation'
    | 'dashboard'
    | 'game'
    | 'teacher_setup'
    | 'playing'
  >('home');

  // Pedagogical Early Childhood Activity State
  const [activePedagogyActivity, setActivePedagogyActivity] = useState<PreschoolActivity>(
    ACTIVITIES_12_18[0]
  );
  const [pedagogySoundEnabled, setPedagogySoundEnabled] = useState<boolean>(true);

  const handleNextPedagogicalActivity = () => {
    const pool = activePedagogyActivity.ageGroup === '12-18' ? ACTIVITIES_12_18 : ACTIVITIES_18_24;
    const currentIndex = pool.findIndex((a) => a.id === activePedagogyActivity.id);
    const nextIndex = (currentIndex + 1) % pool.length;
    setActivePedagogyActivity(pool[nextIndex]);
    setCurrentView('pedagogy_activity');
  };

  // Interactive Game Session Configuration
  const [sessionConfig, setSessionConfig] = useState<{
    topicId: string;
    gameMode: PlayGameMode;
    questionCount: number;
    difficulty: 'easy' | 'medium' | 'hard';
    soundEnabled: boolean;
  }>({
    topicId: 'animals',
    gameMode: 'listen_find',
    questionCount: 5,
    difficulty: 'medium',
    soundEnabled: true,
  });

  // Core Data State
  const [games, setGames] = useState<TopicGame[]>(() => loadStoredGames());
  const [settings, setSettings] = useState<PreschoolSettings>(() => loadStoredSettings());
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>(() => loadStoredLessonPlans());
  const [childrenList, setChildrenList] = useState<ChildProfile[]>(() => loadStoredChildren());
  const [activityResults, setActivityResults] = useState<ChildActivityResult[]>(() =>
    loadStoredActivityResults()
  );
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => loadStoredMedia());
  const [progressStats, setProgressStats] = useState<Record<string, TopicProgressStat>>(() =>
    loadProgressStats()
  );

  const [currentGameId, setCurrentGameId] = useState<string>(() => {
    const loaded = loadStoredGames();
    return loaded.length > 0 ? loaded[0].id : DEFAULT_GAMES[0].id;
  });

  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  // Modals
  const [isAIGameBuilderOpen, setIsAIGameBuilderOpen] = useState(false);
  const [aiBuilderInitialTopic, setAiBuilderInitialTopic] = useState('');
  const [isLessonPlanOpen, setIsLessonPlanOpen] = useState(false);
  const [activeLessonPlanId, setActiveLessonPlanId] = useState<string | undefined>();
  const [isChildrenOpen, setIsChildrenOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [qrTargetGame, setQrTargetGame] = useState<TopicGame | null>(null);
  const [isTeacherStudioOpen, setIsTeacherStudioOpen] = useState(false);
  const [isTopicSelectorOpen, setIsTopicSelectorOpen] = useState(false);
  const [isChildLockOpen, setIsChildLockOpen] = useState(false);
  const [pendingLockAction, setPendingLockAction] = useState<(() => void) | null>(null);

  // Check URL query parameters (e.g. ?gameId=...&mode=tv for QR Code direct scan)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlGameId = params.get('gameId');
      const urlMode = params.get('mode');

      if (urlGameId) {
        const found = games.find((g) => g.id === urlGameId);
        if (found) {
          setCurrentGameId(found.id);
          setCurrentView('playing');
          if (urlMode === 'tv') {
            setSettings((prev) => ({ ...prev, touchTVMode: true }));
          }
        }
      }
    }
  }, []);

  // Sync settings with audio engine
  useEffect(() => {
    audioEngine.setVoiceMode(settings.voiceMode || 'ai_preferred');
    if (settings.preferredVoiceURI) {
      audioEngine.setPreferredVoice(settings.preferredVoiceURI);
    }
    audioEngine.setSSMLConfig(settings.enableSSML ?? true, settings.ssmlBreakDurationMs ?? 450);
  }, [settings.voiceMode, settings.preferredVoiceURI, settings.enableSSML, settings.ssmlBreakDurationMs]);

  // Sync games
  const handleSaveGames = (updatedGames: TopicGame[]) => {
    setGames(updatedGames);
    saveStoredGames(updatedGames);
  };

  // Sync settings
  const handleUpdateSettings = (newSettings: PreschoolSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Sync children
  const handleSaveChildren = (updated: ChildProfile[]) => {
    setChildrenList(updated);
    saveStoredChildren(updated);
  };

  // Sync media
  const handleSaveMedia = (updated: MediaItem[]) => {
    setMediaList(updated);
    saveStoredMedia(updated);
  };

  // Current selected game
  const currentGame = games.find((g) => g.id === currentGameId) || games[0] || DEFAULT_GAMES[0];
  const activeChild = childrenList.find((c) => c.id === activeChildId) || null;

  const handleSelectGame = (game: TopicGame) => {
    setCurrentGameId(game.id);
  };

  const handlePlayGame = (game: TopicGame) => {
    setCurrentGameId(game.id);
    setCurrentView('playing');
  };

  const handleDeleteGame = (gameId: string) => {
    if (games.length <= 1) {
      alert('Phải giữ lại ít nhất 1 bài học trong hệ thống.');
      return;
    }
    const updated = games.filter((g) => g.id !== gameId);
    setGames(updated);
    saveStoredGames(updated);

    if (currentGameId === gameId) {
      setCurrentGameId(updated[0]?.id || DEFAULT_GAMES[0].id);
    }
  };

  // Protected action with Child Lock
  const requestProtectedAction = (action: () => void) => {
    if (settings.childLockEnabled) {
      setPendingLockAction(() => action);
      setIsChildLockOpen(true);
    } else {
      action();
    }
  };

  const handleChildLockSuccess = () => {
    setIsChildLockOpen(false);
    if (pendingLockAction) {
      pendingLockAction();
      setPendingLockAction(null);
    }
  };

  // Save game from AI builder and optionally generate lesson plan
  const handleSaveAndPublishFromAI = async (
    newGame: TopicGame,
    generateLessonPlanToo: boolean
  ) => {
    const updatedGames = [newGame, ...games];
    handleSaveGames(updatedGames);
    setCurrentGameId(newGame.id);
    setIsAIGameBuilderOpen(false);

    if (generateLessonPlanToo) {
      try {
        const res = await fetch('/api/ai-lesson-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameTitle: newGame.title,
            topic: newGame.topic,
            ageRange: newGame.ageRange,
            items: newGame.items,
            objectives: newGame.objectives,
          }),
        });
        const data = await res.json();
        if (data && data.lessonPlan) {
          data.lessonPlan.gameId = newGame.id;
          saveSingleLessonPlan(data.lessonPlan);
          setLessonPlans(loadStoredLessonPlans());
        }
      } catch (e) {
        console.warn('AI Lesson plan background generation warning:', e);
      }
    }

    // Open QR modal to project or play
    setQrTargetGame(newGame);
    setIsQRCodeOpen(true);
  };

  // Import backup file
  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const imported = await importGamesFromJsonFile(file);
          if (imported.length > 0) {
            handleSaveGames(imported);
            alert(`Đã nhập thành công ${imported.length} bài học!`);
          }
        } catch {
          alert('Không thể đọc file sao lưu. Vui lòng kiểm tra file JSON!');
        }
      }
    };
    input.click();
  };

  return (
    <div className="w-full min-h-screen bg-amber-50/40 text-slate-800 font-sans">
      {/* 1. TOP TEACHER QUICK NAV HEADER (When in Dashboard) */}
      {currentView === 'dashboard' && (
        <header className="bg-white/95 border-b border-amber-200/80 sticky top-0 z-30 backdrop-blur-md px-4 sm:px-8 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white font-black text-xl shadow-md">
                👶
              </div>
              <div>
                <span className="font-black text-lg sm:text-xl text-amber-950 tracking-tight block leading-tight">
                  TinyLearn
                </span>
                <span className="text-[11px] font-bold text-amber-800 block">
                  Bé Khám Phá (12–24 Tháng)
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-2xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>🏠</span>
                <span>Trang chủ</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('teacher_pedagogy')}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-black text-xs sm:text-sm rounded-2xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>👩‍🏫</span>
                <span className="hidden sm:inline">Nhà Trẻ (12–24m)</span>
                <span className="sm:hidden">Nhà Trẻ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAiBuilderInitialTopic('');
                  setIsAIGameBuilderOpen(true);
                }}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs sm:text-sm rounded-2xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>✨</span>
                <span className="hidden sm:inline">AI Tạo Bài Nhanh</span>
                <span className="sm:hidden">Tạo Bài</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('game')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>👶</span>
                <span>Bé Chơi</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* 2. MAIN VIEW SWITCHER */}
      {currentView === 'home' ? (
        /* HOME SCREEN: 2 BIG MODES (BÉ HOẠT ĐỘNG & GIÁO VIÊN) */
        <HomePage
          onSelectToddlerMode={() => {
            setActivePedagogyActivity(ACTIVITIES_12_18[0]);
            setCurrentView('pedagogy_activity');
          }}
          onSelectTeacherMode={() => setCurrentView('teacher_pedagogy')}
        />
      ) : currentView === 'teacher_pedagogy' ? (
        /* TEACHER PEDAGOGY HUB (4 DOMAINS, 75+ ACTIVITIES, OBSERVATION LOG) */
        <TeacherPedagogyHub
          onStartActivity={(activity, sound) => {
            setActivePedagogyActivity(activity);
            setPedagogySoundEnabled(sound);
            setCurrentView('pedagogy_activity');
          }}
          onGoHome={() => setCurrentView('home')}
          onOpenAdvancedStudio={() => setCurrentView('dashboard')}
        />
      ) : currentView === 'pedagogy_activity' ? (
        /* TODDLER FULLSCREEN ACTIVITY CANVAS (2-3 BIG IMAGES, GENTLE FEEDBACK, NO FAIL) */
        <ToddlerActivityCanvas
          activity={activePedagogyActivity}
          soundEnabled={pedagogySoundEnabled}
          onActivityComplete={() => setCurrentView('pedagogy_observation')}
          onExit={() => setCurrentView('teacher_pedagogy')}
        />
      ) : currentView === 'pedagogy_observation' ? (
        /* TEACHER OBSERVATION LOGGING & REAL LIFE EXTENSION (🌱) */
        <ObservationForm
          activity={activePedagogyActivity}
          onNextActivity={handleNextPedagogicalActivity}
          onGoHome={() => setCurrentView('home')}
          onOpenTeacherMenu={() => setCurrentView('teacher_pedagogy')}
        />
      ) : currentView === 'teacher_setup' ? (
        /* TEACHER SETUP: AGE, TOPIC, GAME MODE, DIFFICULTY, SOUND, VOICE */
        <TeacherSetup
          onStartActivity={(config) => {
            setSessionConfig(config);
            setCurrentView('game');
          }}
          onGoHome={() => setCurrentView('home')}
          onOpenAdvancedStudio={() => setCurrentView('dashboard')}
        />
      ) : currentView === 'game' ? (
        /* FULLSCREEN TODDLER INTERACTIVE GAME */
        <GameScreen
          topicId={sessionConfig.topicId}
          gameMode={sessionConfig.gameMode}
          questionCount={sessionConfig.questionCount}
          difficulty={sessionConfig.difficulty}
          soundEnabled={sessionConfig.soundEnabled}
          onGoHome={() => setCurrentView('home')}
          onChangeTopic={() => setCurrentView('teacher_setup')}
        />
      ) : currentView === 'dashboard' ? (
        <TeacherDashboard
          games={games}
          settings={settings}
          childrenList={childrenList}
          lessonPlans={lessonPlans}
          onOpenAIGameBuilder={(initial) => {
            setAiBuilderInitialTopic(initial || '');
            setIsAIGameBuilderOpen(true);
          }}
          onOpenMyGames={() => setIsTopicSelectorOpen(true)}
          onOpenLessonPlans={() => setIsLessonPlanOpen(true)}
          onOpenLibrary={() => setIsLibraryOpen(true)}
          onOpenChildren={() => setIsChildrenOpen(true)}
          onOpenReports={() => setIsReportsOpen(true)}
          onOpenStudioSettings={() => setIsTeacherStudioOpen(true)}
          onOpenQRCode={(g) => {
            setQrTargetGame(g);
            setIsQRCodeOpen(true);
          }}
          onPlayGame={handlePlayGame}
          onDeleteGame={handleDeleteGame}
          onExportBackup={() => exportGamesToJson(games)}
          onImportBackup={handleImportBackup}
        />
      ) : (
        /* TODDLER MAIN PLAYING CANVAS (LEGACY CUSTOM GAME MODE) */
        <ToddlerPlayArea
          game={currentGame}
          settings={settings}
          activeChild={activeChild}
          onOpenTeacherStudio={() => requestProtectedAction(() => setIsTeacherStudioOpen(true))}
          onOpenTopicSelector={() => setIsTopicSelectorOpen(true)}
          onUpdateSettings={handleUpdateSettings}
          onExitToDashboard={() => requestProtectedAction(() => setCurrentView('dashboard'))}
        />
      )}

      {/* =================================================== */}
      {/* ALL TEACHER MODALS & SPECIALIZED TOOLS */}
      {/* =================================================== */}

      {/* 1. AI GAME BUILDER MODAL */}
      <AIGameBuilderModal
        isOpen={isAIGameBuilderOpen}
        initialTopic={aiBuilderInitialTopic}
        settings={settings}
        onClose={() => setIsAIGameBuilderOpen(false)}
        onSaveAndPublish={handleSaveAndPublishFromAI}
      />

      {/* 2. LESSON PLAN MODAL */}
      <LessonPlanModal
        isOpen={isLessonPlanOpen}
        lessonPlans={lessonPlans}
        games={games}
        currentPlanId={activeLessonPlanId}
        onClose={() => setIsLessonPlanOpen(false)}
        onSavePlan={(plan) => {
          saveSingleLessonPlan(plan);
          setLessonPlans(loadStoredLessonPlans());
        }}
        onGeneratePlanForGame={async (g) => {
          try {
            const res = await fetch('/api/ai-lesson-plan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                gameTitle: g.title,
                topic: g.topic,
                ageRange: g.ageRange,
                items: g.items,
                objectives: g.objectives,
              }),
            });
            const d = await res.json();
            if (d && d.lessonPlan) {
              d.lessonPlan.gameId = g.id;
              saveSingleLessonPlan(d.lessonPlan);
              setLessonPlans(loadStoredLessonPlans());
              setActiveLessonPlanId(d.lessonPlan.id);
            }
          } catch (e) {
            console.warn('Generate plan error:', e);
          }
        }}
      />

      {/* 3. CHILDREN MANAGER MODAL */}
      <ChildrenManagerModal
        isOpen={isChildrenOpen}
        childrenList={childrenList}
        activeChildId={activeChildId}
        onClose={() => setIsChildrenOpen(false)}
        onSelectActiveChild={(id) => setActiveChildId(id)}
        onSaveChildren={handleSaveChildren}
      />

      {/* 4. REPORTS MODAL */}
      <ReportsModal
        isOpen={isReportsOpen}
        progressStats={progressStats}
        childrenList={childrenList}
        activityResults={activityResults}
        onClose={() => setIsReportsOpen(false)}
        onResetStats={() => setProgressStats({})}
      />

      {/* 5. MEDIA LIBRARY MODAL */}
      <MediaLibraryModal
        isOpen={isLibraryOpen}
        mediaList={mediaList}
        onClose={() => setIsLibraryOpen(false)}
        onSaveMediaList={handleSaveMedia}
      />

      {/* 6. QR CODE MODAL */}
      <QRCodeModal
        isOpen={isQRCodeOpen}
        game={qrTargetGame}
        onClose={() => setIsQRCodeOpen(false)}
        onPlayTouchTV={(g) => {
          handlePlayGame(g);
          setSettings((prev) => ({ ...prev, touchTVMode: true }));
        }}
      />

      {/* 7. TOPIC SELECTOR MODAL */}
      <TopicSelectorModal
        isOpen={isTopicSelectorOpen}
        games={games}
        currentGameId={currentGameId}
        onSelectGame={(g) => {
          handleSelectGame(g);
          setIsTopicSelectorOpen(false);
          setCurrentView('playing');
        }}
        onCreateNewTopic={() => {
          setIsTopicSelectorOpen(false);
          setIsAIGameBuilderOpen(true);
        }}
        onDeleteGame={handleDeleteGame}
        onClose={() => setIsTopicSelectorOpen(false)}
      />

      {/* 8. TEACHER STUDIO (Full Editor & Audio Settings) */}
      <TeacherStudio
        isOpen={isTeacherStudioOpen}
        games={games}
        currentGameId={currentGameId}
        settings={settings}
        onSaveGames={handleSaveGames}
        onSelectGame={handleSelectGame}
        onUpdateSettings={handleUpdateSettings}
        onClose={() => setIsTeacherStudioOpen(false)}
      />

      {/* 9. CHILD LOCK PIN PROTECTION */}
      <ChildLockModal
        isOpen={isChildLockOpen}
        onSuccess={handleChildLockSuccess}
        onClose={() => {
          setIsChildLockOpen(false);
          setPendingLockAction(null);
        }}
      />
    </div>
  );
}
