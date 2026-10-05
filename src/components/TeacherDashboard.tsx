import React, { useState } from 'react';
import {
  Sparkles,
  Gamepad2,
  BookOpen,
  FileText,
  Users,
  BarChart3,
  Mic,
  Settings,
  QrCode,
  Play,
  Plus,
  Download,
  Upload,
  ArrowRight,
  ShieldCheck,
  Tv,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  Trash2,
  Volume2,
} from 'lucide-react';
import { TopicGame, PreschoolSettings, ChildProfile, LessonPlan } from '../types.ts';
import { audioManager } from '../services/audioManager.ts';

interface TeacherDashboardProps {
  games: TopicGame[];
  settings: PreschoolSettings;
  childrenList: ChildProfile[];
  lessonPlans: LessonPlan[];
  onOpenAIGameBuilder: (initialTopic?: string) => void;
  onOpenMyGames: () => void;
  onOpenLessonPlans: () => void;
  onOpenLessonPlanLibrary?: () => void;
  onOpenLibrary: () => void;
  onOpenChildren: () => void;
  onOpenReports: () => void;
  onOpenStudioSettings: () => void;
  onOpenQRCode: (game: TopicGame) => void;
  onPlayGame: (game: TopicGame) => void;
  onDeleteGame?: (gameId: string) => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  games,
  settings,
  childrenList,
  lessonPlans,
  onOpenAIGameBuilder,
  onOpenMyGames,
  onOpenLessonPlans,
  onOpenLessonPlanLibrary,
  onOpenLibrary,
  onOpenChildren,
  onOpenReports,
  onOpenStudioSettings,
  onOpenQRCode,
  onPlayGame,
  onDeleteGame,
  onExportBackup,
  onImportBackup,
}) => {
  const [quickPrompt, setQuickPrompt] = useState('');
  const [isTestingAudio, setIsTestingAudio] = useState(false);

  const handleTestSpeaker = () => {
    setIsTestingAudio(true);
    audioManager.unlockAudio();
    audioManager.playVoice(
      'Xin chào cô giáo! Hệ thống âm thanh TinyLearn đã sẵn sàng hoạt động rất tốt!',
      undefined,
      {
        onEnd: () => setIsTestingAudio(false),
        onError: () => setIsTestingAudio(false),
      }
    );
  };

  const handleQuickCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onOpenAIGameBuilder(quickPrompt || 'Con vật đáng yêu – trẻ 12–24 tháng');
  };

  const suggestedPrompts = [
    '🐾 Con vật nuôi trong nhà',
    '🍎 Trái cây ngọt lành & màu sắc',
    '🚗 Phương tiện giao thông kêu bíp bíp',
    '🥕 Rau củ bé ăn ngon miệng',
    '👀 Cơ thể bé yêu (mắt, mũi, miệng)',
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO SECTION: "BẠN MUỐN DẠY TRẺ ĐIỀU GÌ HÔM NAY?" */}
      <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-200 p-6 sm:p-10 shadow-xl border-4 border-white">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 text-amber-950 text-xs sm:text-sm font-black shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>AI Giáo Dục Mầm Non 12–24 Tháng • Hoàn tất trong 1 phút</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-950 tracking-tight leading-tight">
            Bạn muốn dạy trẻ điều gì hôm nay?
          </h1>

          <p className="text-sm sm:text-base font-bold text-amber-900/90 leading-relaxed max-w-2xl">
            Chỉ cần nhập chủ đề mầm non, TinyLearn sẽ <strong>tự động sinh trò chơi tương tác</strong>,{' '}
            <strong>giọng nữ tiếng Việt chuẩn 100%</strong>, <strong>giáo án đầy đủ</strong> và{' '}
            <strong>mã QR trình chiếu lên TV cảm ứng</strong>.
          </p>

          {/* Quick Search / Generation Bar */}
          <form onSubmit={handleQuickCreate} className="pt-2">
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 bg-white p-2.5 rounded-3xl shadow-lg border-2 border-amber-300/80">
              <input
                type="text"
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                placeholder="Ví dụ: Nhận biết con vật cho trẻ 12–24 tháng..."
                className="flex-1 px-4 py-3 text-slate-800 font-bold text-sm sm:text-base rounded-2xl focus:outline-hidden placeholder:text-slate-400 placeholder:font-medium"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm sm:text-base rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 fill-white" />
                <span>✨ Tạo hoạt động bằng AI</span>
              </button>
            </div>
          </form>

          {/* Suggestion Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="font-extrabold text-amber-950/70">Gợi ý nhanh:</span>
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setQuickPrompt(prompt.slice(2).trim());
                  onOpenAIGameBuilder(prompt.slice(2).trim());
                }}
                className="px-3 py-1 bg-white/70 hover:bg-white text-amber-950 font-bold rounded-xl transition-all shadow-2xs hover:scale-105 cursor-pointer"
              >
                {prompt}
              </button>
            ))}

            {/* Audio Test button */}
            <button
              type="button"
              onClick={handleTestSpeaker}
              className={`px-3 py-1 bg-amber-950 text-white font-black rounded-xl transition-all shadow-2xs hover:scale-105 cursor-pointer flex items-center gap-1.5 ml-auto sm:ml-2 ${
                isTestingAudio ? 'bg-emerald-600 ring-2 ring-emerald-300 animate-pulse' : 'hover:bg-amber-900'
              }`}
              title="Nhấn để kiểm tra loa và kích hoạt âm thanh"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isTestingAudio ? 'animate-bounce' : ''}`} />
              <span>{isTestingAudio ? 'Đang phát...' : '🔊 Thử loa & giọng nói'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATS OVERVIEW BAR */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-amber-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl font-black">
            🎮
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{games.length}</div>
            <div className="text-xs font-bold text-slate-500">Trò chơi sẵn có</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-emerald-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl font-black">
            📝
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{lessonPlans.length}</div>
            <div className="text-xs font-bold text-slate-500">Giáo án chuẩn Bộ</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-sky-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center text-2xl font-black">
            👶
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">{childrenList.length}</div>
            <div className="text-xs font-bold text-slate-500">Bé trong danh sách</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-rose-100 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center text-2xl font-black">
            🎙️
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">100%</div>
            <div className="text-xs font-bold text-slate-500">Giọng nữ Việt chuẩn</div>
          </div>
        </div>
      </section>

      {/* 3. MAIN TEACHER FEATURE TILES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>📚</span>
            <span>Không Gian Sư Phạm & Quản Lý Hoạt Động</span>
          </h2>
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            Dành riêng cho giáo viên mầm non
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tile 1: AI Game Builder */}
          <button
            onClick={() => onOpenAIGameBuilder()}
            className="group p-5 bg-gradient-to-br from-amber-500/10 via-amber-100/50 to-white rounded-3xl border-2 border-amber-200 hover:border-amber-400 text-left transition-all hover:shadow-lg active:scale-98 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 fill-white" />
              </div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-900 transition-colors">
                ✨ AI Tạo Trò Chơi Mới
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                Nhập chủ đề và độ tuổi → AI tự sinh câu hỏi, đối tượng, gợi ý vận động và âm thanh trong 1 phút.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-amber-800">
              <span>Bắt đầu tạo ngay</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Tile 2: My Games */}
          <button
            onClick={onOpenMyGames}
            className="group p-5 bg-gradient-to-br from-blue-500/10 via-sky-100/50 to-white rounded-3xl border-2 border-sky-200 hover:border-sky-400 text-left transition-all hover:shadow-lg active:scale-98 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 group-hover:text-sky-900 transition-colors">
                  🎮 Trò Chơi Của Tôi
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-sky-100 text-sky-800">
                  {games.length} bài
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                Kho trò chơi tương tác đa dạng dạng bài: Nghe và tìm, Chạm để nghe, Ai biến mất, Bong bóng kiến thức.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-sky-800">
              <span>Mở danh sách bài</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Tile 3: AI Lesson Plans */}
          <button
            onClick={onOpenLessonPlanLibrary || onOpenLessonPlans}
            className="group p-5 bg-gradient-to-br from-emerald-500/10 via-emerald-100/50 to-white rounded-3xl border-2 border-emerald-200 hover:border-emerald-400 text-left transition-all hover:shadow-lg active:scale-98 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-900 transition-colors">
                  📘 Kho Giáo Án Nhà Trẻ
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800">
                  60 bài chuẩn
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                Giáo án 2 cột chuẩn Bộ GD&ĐT (12–18m & 18–24m), tích hợp trình chiếu tiết dạy điện tử không ép buộc trẻ.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-emerald-800">
              <span>Mở kho giáo án & tiết dạy</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Tile 4: Media Library */}
          <button
            onClick={onOpenLibrary}
            className="group p-5 bg-gradient-to-br from-purple-500/10 via-purple-100/50 to-white rounded-3xl border-2 border-purple-200 hover:border-purple-400 text-left transition-all hover:shadow-lg active:scale-98 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-900 transition-colors">
                📚 Thư Viện Học Liệu
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                Kho ảnh minh họa vector sắc nét, âm thanh mẫu phân loại theo 10 chủ đề mầm non quen thuộc.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-purple-800">
              <span>Khám phá học liệu</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Tile 5: Children Profiles */}
          <button
            onClick={onOpenChildren}
            className="group p-5 bg-gradient-to-br from-pink-500/10 via-pink-100/50 to-white rounded-3xl border-2 border-pink-200 hover:border-pink-400 text-left transition-all hover:shadow-lg active:scale-98 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-pink-900 transition-colors">
                👶 Hồ Sơ Trẻ & Nhật Ký
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                Quản lý danh sách trẻ theo nhóm lớp, lưu lại sự tiến bộ cá nhân, phản xạ âm thanh và từ ngữ.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-pink-800">
              <span>Quản lý danh sách trẻ</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Tile 6: Reports & Evaluation */}
          <button
            onClick={onOpenReports}
            className="group p-5 bg-gradient-to-br from-teal-500/10 via-teal-100/50 to-white rounded-3xl border-2 border-teal-200 hover:border-teal-400 text-left transition-all hover:shadow-lg active:scale-98 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-teal-900 transition-colors">
                📊 Báo Cáo & Đánh Giá
              </h3>
              <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
                Theo dõi số lần chọn đúng, mức độ cần gợi ý viền sáng, thời gian tham gia; xuất báo cáo tuần/tháng.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-teal-800">
              <span>Xem bảng theo dõi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* 4. RECENT READY-TO-PLAY GAMES */}
      <section className="bg-white p-6 sm:p-8 rounded-4xl border-2 border-amber-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Trò chơi sẵn sàng cho tiết học
            </h3>
            <p className="text-xs text-slate-500">
              Bấm &ldquo;Chơi ngay&rdquo; để khởi động màn hình tương tác cảm ứng cho trẻ
            </p>
          </div>
          <button
            onClick={onOpenMyGames}
            className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
          >
            <span>Tất cả ({games.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {games.slice(0, 3).map((game) => (
            <div
              key={game.id}
              className="p-4 rounded-3xl border-2 border-slate-100 hover:border-amber-300 bg-slate-50/70 hover:bg-amber-50/50 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-950">
                    {game.ageRange}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    {game.items.length} câu
                  </span>
                </div>
                <h4 className="font-black text-sm text-slate-900 line-clamp-1 group-hover:text-amber-950">
                  {game.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {game.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => onPlayGame(game)}
                  className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Chơi ngay</span>
                </button>
                <button
                  onClick={() => onOpenQRCode(game)}
                  title="Hiện mã QR để mở trên TV / Tablet"
                  className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl active:scale-95 transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-slate-700" />
                </button>
                {onDeleteGame && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Cô có chắc chắn muốn xóa bài học "${game.title}" vì tạo sai không?`)) {
                        onDeleteGame(game.id);
                      }
                    }}
                    title="Xóa bài học này"
                    className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl active:scale-95 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TEACHER BOTTOM TOOLBAR */}
      <section className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-100/80 rounded-3xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-slate-700">
            Khóa trẻ em PIN: {settings.childLockEnabled ? 'Đang bật (Mã PIN: ' + (settings.teacherPin || '1234') + ')' : 'Đang tắt'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenStudioSettings}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 font-bold text-slate-700 rounded-xl border border-slate-200 flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>Cài đặt & Âm thanh</span>
          </button>
          <button
            onClick={onExportBackup}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 font-bold text-slate-700 rounded-xl border border-slate-200 flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Xuất sao lưu</span>
          </button>
          <button
            onClick={onImportBackup}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 font-bold text-slate-700 rounded-xl border border-slate-200 flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Nhập sao lưu</span>
          </button>
        </div>
      </section>
    </div>
  );
};
