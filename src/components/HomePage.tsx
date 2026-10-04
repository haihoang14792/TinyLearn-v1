import React from 'react';
import { Sparkles, Play, Settings, Heart, Music, Sun } from 'lucide-react';
import { audioEngine } from '../utils/audio.ts';

interface HomePageProps {
  onSelectToddlerMode: () => void;
  onSelectTeacherMode: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectToddlerMode,
  onSelectTeacherMode,
}) => {
  const handleToddlerClick = () => {
    audioEngine.playSuccessChime();
    onSelectToddlerMode();
  };

  const handleTeacherClick = () => {
    audioEngine.playPop();
    onSelectTeacherMode();
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/50 to-yellow-50 flex flex-col items-center justify-between p-4 sm:p-8 select-none">
      {/* 1. TOP BRANDING */}
      <header className="w-full max-w-4xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-400 flex items-center justify-center text-3xl shadow-md border-2 border-white">
            👶
          </div>
          <div>
            <span className="font-black text-2xl sm:text-3xl text-amber-950 tracking-tight block leading-tight">
              TinyLearn
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-800 block">
              Trò Chơi Học Tập Mầm Non (12–24 Tháng)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-100/80 text-amber-900 px-3.5 py-1.5 rounded-full border border-amber-300 font-bold text-xs sm:text-sm shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Chuẩn Giáo Dục Nhà Trẻ</span>
        </div>
      </header>

      {/* 2. HERO WELCOME & 2 CORE MODES */}
      <main className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center my-6 sm:my-10 text-center">
        {/* Welcome Tagline */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/90 rounded-full border border-amber-200 text-amber-900 font-black text-xs sm:text-sm mb-3 shadow-xs">
            <span>🌈</span>
            <span>Hình ảnh lớn • Màu sắc tươi vui • Tương tác thông minh</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-amber-950 tracking-tight leading-tight">
            Chào Mừng Bé & Cô Đến Lớp Học!
          </h1>
          <p className="text-sm sm:text-base font-semibold text-slate-600 mt-2 max-w-md mx-auto">
            Vui lòng chọn chế độ sử dụng để bắt đầu giờ học hào hứng nhé:
          </p>
        </div>

        {/* 2 BIG CARDS: BÉ CHƠI & GIÁO VIÊN */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-2xl">
          {/* 1. BÉ CHƠI (TODDLER DIRECT PLAY) */}
          <button
            type="button"
            onClick={handleToddlerClick}
            className="group relative bg-gradient-to-b from-amber-300 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-500 p-6 sm:p-8 rounded-3xl border-4 border-amber-500 shadow-xl active:scale-95 transition-all duration-300 cursor-pointer flex flex-col items-center text-center justify-between min-h-[260px] sm:min-h-[300px]"
          >
            {/* Top Badge */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/95 flex items-center justify-center text-5xl sm:text-6xl shadow-md border-3 border-amber-400 group-hover:scale-110 transition-transform">
              👶
            </div>

            <div className="my-3">
              <span className="text-3xl sm:text-4xl font-black text-amber-950 block tracking-tight">
                Bé hoạt động
              </span>
              <p className="text-xs sm:text-sm font-bold text-amber-900/90 mt-1 max-w-[240px]">
                Toàn màn hình, hình ảnh lớn, không áp lực đúng/sai, bé chỉ cần nghe và chạm hình
              </p>
            </div>

            <div className="w-full py-3.5 px-6 bg-white hover:bg-amber-50 text-amber-950 font-black text-base sm:text-lg rounded-2xl border-2 border-amber-500 shadow-xs flex items-center justify-center gap-2">
              <Play className="w-5 h-5 fill-amber-950 text-amber-950" />
              <span>Bé hoạt động ngay</span>
            </div>
          </button>

          {/* 2. GIÁO VIÊN (TEACHER SETUP & LESSON) */}
          <button
            type="button"
            onClick={handleTeacherClick}
            className="group relative bg-white hover:bg-slate-50 p-6 sm:p-8 rounded-3xl border-4 border-slate-300 hover:border-amber-400 shadow-xl active:scale-95 transition-all duration-300 cursor-pointer flex flex-col items-center text-center justify-between min-h-[260px] sm:min-h-[300px]"
          >
            {/* Top Badge */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-50 flex items-center justify-center text-5xl sm:text-6xl shadow-md border-3 border-slate-200 group-hover:scale-110 transition-transform">
              👩‍🏫
            </div>

            <div className="my-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-800 block tracking-tight">
                Giáo viên
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1 max-w-[240px]">
                Chọn độ tuổi, 4 lĩnh vực phát triển, xem mục tiêu, gợi ý mở rộng đồ vật thật & nhật ký quan sát
              </p>
            </div>

            <div className="w-full py-3.5 px-6 bg-slate-100 group-hover:bg-amber-400 text-slate-800 group-hover:text-amber-950 font-black text-base sm:text-lg rounded-2xl border-2 border-slate-300 group-hover:border-amber-500 shadow-xs flex items-center justify-center gap-2 transition-colors">
              <Settings className="w-5 h-5" />
              <span>Tổ chức hoạt động</span>
            </div>
          </button>
        </div>
      </main>

      {/* 3. FOOTER INFO */}
      <footer className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold text-slate-500 pt-4 border-t border-amber-200/60 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span>👶 Dành cho trẻ 12–24 tháng</span>
          <span>•</span>
          <span>Tương thích Touch TV, Máy tính bảng, Điện thoại</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-800 font-bold">
          <span>Tiếng Việt chuẩn mầm non</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </div>
      </footer>
    </div>
  );
};
