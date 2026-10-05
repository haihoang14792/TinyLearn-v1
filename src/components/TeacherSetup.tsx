import React, { useState } from 'react';
import {
  Play,
  Volume2,
  VolumeX,
  History,
  Layers,
  Sparkles,
  ArrowLeft,
  Settings,
  Baby,
  Smile,
} from 'lucide-react';
import { TOPIC_CATEGORIES, TopicCategory } from '../data/topics.ts';
import { PlayGameMode } from './GameScreen.tsx';
import { HistoryScreen } from './HistoryScreen.tsx';
import { audioEngine } from '../utils/audio.ts';

interface TeacherSetupProps {
  onStartActivity: (config: {
    topicId: string;
    gameMode: PlayGameMode;
    questionCount: number;
    difficulty: 'easy' | 'medium' | 'hard';
    soundEnabled: boolean;
    shuffleChoices?: boolean;
  }) => void;
  onGoHome: () => void;
  onOpenAdvancedStudio: () => void;
}

export const TeacherSetup: React.FC<TeacherSetupProps> = ({
  onStartActivity,
  onGoHome,
  onOpenAdvancedStudio,
}) => {
  // Form selections
  const [selectedAge, setSelectedAge] = useState<'12-18' | '18-24'>('12-18');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('animals');
  const [selectedMode, setSelectedMode] = useState<PlayGameMode>('listen_find');
  const [selectedQuestionCount, setSelectedQuestionCount] = useState<number>(5);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [shuffleChoices, setShuffleChoices] = useState<boolean>(false);

  // Toggle history screen
  const [showHistory, setShowHistory] = useState(false);

  // Test Vietnamese Voice
  const handleTestVoice = () => {
    audioEngine.speak('Xin chào cô giáo! Giọng đọc tiếng Việt sẵn sàng cho tiết học mầm non.', {
      rate: 0.88,
    });
  };

  const handleStart = () => {
    audioEngine.playPop();
    onStartActivity({
      topicId: selectedTopicId,
      gameMode: selectedMode,
      questionCount: selectedQuestionCount,
      difficulty: selectedDifficulty,
      soundEnabled,
      shuffleChoices,
    });
  };

  if (showHistory) {
    return <HistoryScreen onBack={() => setShowHistory(false)} />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 animate-fadeIn select-none">
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-amber-200">
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-amber-50 rounded-2xl border-2 border-amber-200 text-amber-950 font-black text-xs sm:text-sm shadow-xs cursor-pointer active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-amber-600" />
          <span>Trang chủ</span>
        </button>

        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-black text-amber-950 flex items-center justify-center gap-2">
            <span>👩‍🏫</span>
            <span>Thiết Lập Bài Học (Giáo Viên)</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-amber-800">
            Cấu hình hoạt động tương tác trước khi đưa vào tiết dạy
          </p>
        </div>

        {/* Access to history and advanced tools */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs sm:text-sm rounded-xl border border-indigo-200 cursor-pointer shadow-xs active:scale-95 transition-all"
            title="Xem lịch sử kết quả của các lượt chơi"
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Lịch sử</span>
          </button>

          <button
            type="button"
            onClick={onOpenAdvancedStudio}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs border border-amber-500 cursor-pointer active:scale-95 transition-all"
            title="Mở bảng điều khiển giáo án AI & quản lý trẻ"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Studio</span>
          </button>
        </div>
      </div>

      {/* SETUP SECTIONS */}
      <div className="space-y-6">
        {/* 1. CHỦ ĐỀ HOẠT ĐỘNG (8 Topics Grid) */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border-2 border-slate-200 shadow-xs">
          <label className="block text-sm sm:text-base font-black text-slate-800 mb-3 flex items-center gap-2">
            <span className="text-lg">📚</span>
            <span>1. Chọn Chủ Đề Hoạt Động (8 Chủ Đề Mầm Non Chuẩn):</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {TOPIC_CATEGORIES.map((topic) => {
              const isSelected = selectedTopicId === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedTopicId(topic.id)}
                  style={{
                    backgroundColor: isSelected ? topic.color : '#F8FAFC',
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
                    isSelected
                      ? 'border-amber-500 shadow-md scale-[1.02] ring-2 ring-amber-300'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl">{topic.icon}</span>
                    <span className="text-[11px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-full">
                      {topic.items.length} hình
                    </span>
                  </div>
                  <span
                    className={`font-black text-xs sm:text-sm block mt-2 ${
                      isSelected ? 'text-amber-950' : 'text-slate-700'
                    }`}
                  >
                    {topic.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. DẠNG TRÒ CHƠI & ĐỘ TUỔI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DẠNG TRÒ CHƠI (4 Game Modes) */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-xs space-y-3">
            <label className="block text-sm sm:text-base font-black text-slate-800 flex items-center gap-2">
              <span className="text-lg">🎮</span>
              <span>2. Dạng Trò Chơi:</span>
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'listen_find',
                  title: '🎧 Nghe và tìm',
                  desc: 'Ví dụ: "Con mèo đâu?" → Trẻ chọn hình mèo',
                },
                {
                  id: 'sound_guess',
                  title: '🔊 Nghe tiếng đoán con vật',
                  desc: 'Phát tiếng: "Meo meo" → Trẻ chọn hình mèo',
                },
                {
                  id: 'touch_request',
                  title: '👆 Tìm theo yêu cầu',
                  desc: 'Ví dụ: "Hãy tìm quả chuối" → Trẻ chọn hình chuối',
                },
                {
                  id: 'imitation',
                  title: '🗣️ Nghe và bắt chước',
                  desc: 'Hiện hình, đọc: "Con nói: Mèo" → Hiện nút Tiếp theo',
                },
              ].map((m) => {
                const isSelected = selectedMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMode(m.id as PlayGameMode)}
                    className={`w-full p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col ${
                      isSelected
                        ? 'bg-amber-100/80 border-amber-500 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-black text-xs sm:text-sm text-slate-900">
                      {m.title}
                    </span>
                    <span className="text-[11px] text-slate-600 mt-0.5">
                      {m.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ĐỘ TUỔI & MỨC ĐỘ & SỐ CÂU */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-xs flex flex-col justify-between gap-4">
            {/* ĐỘ TUỔI */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-2 flex items-center gap-1.5">
                <Baby className="w-4 h-4 text-amber-600" />
                <span>Độ tuổi của trẻ:</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: '12-18', label: '12–18 tháng', note: 'Giai đoạn tập nhận biết' },
                  { id: '18-24', label: '18–24 tháng', note: 'Giai đoạn tập nói & phản xạ' },
                ].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setSelectedAge(a.id as any);
                      if (a.id === '12-18') {
                        setSelectedDifficulty('easy');
                        setShuffleChoices(false);
                      } else {
                        setShuffleChoices(true);
                      }
                    }}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      selectedAge === a.id
                        ? 'bg-amber-400 border-amber-500 text-amber-950 font-black shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 font-bold'
                    }`}
                  >
                    <span className="text-xs sm:text-sm block">{a.label}</span>
                    <span className="text-[10px] opacity-80 block">{a.note}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* MỨC ĐỘ (2, 3, 4 HÌNH) */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Mức độ (Số lượng hình hiển thị):</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'easy', label: 'Dễ', sub: '2 hình' },
                  { id: 'medium', label: 'Trung bình', sub: '3 hình' },
                  { id: 'hard', label: 'Khó', sub: '4 hình' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDifficulty(d.id as any)}
                    className={`p-2 rounded-xl border-2 text-center transition-all cursor-pointer ${
                      selectedDifficulty === d.id
                        ? 'bg-amber-400 border-amber-500 text-amber-950 font-black shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 font-bold'
                    }`}
                  >
                    <span className="text-xs sm:text-sm block">{d.label}</span>
                    <span className="text-[11px] text-slate-600 block">{d.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SỐ CÂU (5, 10, 15) */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-2 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-amber-600" />
                <span>Số lượng câu hỏi trong lượt chơi:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setSelectedQuestionCount(cnt)}
                    className={`py-2 rounded-xl border-2 text-center transition-all cursor-pointer font-black text-xs sm:text-sm ${
                      selectedQuestionCount === cnt
                        ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {cnt} câu
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. ÂM THANH & GIỌNG ĐỌC NỮ TIẾNG VIỆT */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* BẬT / TẮT ÂM THANH */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-2xl border-2 shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-100 border-amber-300 text-amber-950 font-black'
                  : 'bg-slate-100 border-slate-300 text-slate-500 font-bold'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-amber-700" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
              <span className="text-xs sm:text-sm">
                Âm thanh: {soundEnabled ? 'BẬT' : 'TẮT'}
              </span>
            </button>

            <span className="text-xs text-slate-500 hidden sm:inline">
              (Bao gồm hiệu ứng khen ngợi ⭐ 🎉 và chuông reo)
            </span>
          </div>

          {/* GIỌNG ĐỌC NỮ TIẾNG VIỆT */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700">
              Giọng đọc: <span className="text-emerald-700 font-black">Giọng nữ tiếng Việt (vi-VN)</span>
            </span>
            <button
              type="button"
              onClick={handleTestVoice}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs rounded-xl border border-emerald-300 cursor-pointer active:scale-95 transition-all flex items-center gap-1"
            >
              <span>🔊</span>
              <span>Thử giọng</span>
            </button>
          </div>
        </div>

        {/* 4. BIG START BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-4 sm:py-5 px-8 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xl sm:text-2xl rounded-3xl shadow-xl border-3 border-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-7 h-7 fill-white" />
            <span>▶ BẮT ĐẦU HOẠT ĐỘNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
