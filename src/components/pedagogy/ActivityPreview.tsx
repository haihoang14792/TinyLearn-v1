import React from 'react';
import { PreschoolActivity, DEVELOPMENTAL_DOMAINS } from '../../data/activityTypes.ts';
import { Play, CheckCircle, Target, Package, Sparkles, Eye, ArrowRight } from 'lucide-react';
import { audioEngine } from '../../utils/audio.ts';

interface ActivityPreviewProps {
  activity: PreschoolActivity;
  onStart: () => void;
  onViewLessonPlan?: () => void;
  onBack?: () => void;
}

export const ActivityPreview: React.FC<ActivityPreviewProps> = ({
  activity,
  onStart,
  onViewLessonPlan,
  onBack,
}) => {
  const domainInfo = DEVELOPMENTAL_DOMAINS.find((d) =>
    activity.domain.includes(d.id)
  ) || DEVELOPMENTAL_DOMAINS[0];

  const handleStartActivity = () => {
    audioEngine.playPop();
    onStart();
  };

  return (
    <div className="w-full bg-white rounded-3xl border-3 border-amber-300 shadow-md p-5 sm:p-7 select-none animate-fadeIn">
      {/* 1. TOP HEADER & BADGES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              style={{ backgroundColor: domainInfo.bgColor, color: domainInfo.color }}
              className="text-xs font-black px-2.5 py-0.5 rounded-full border border-current"
            >
              {domainInfo.name}
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {activity.ageGroup === '12-18' ? 'Nhóm 12–18 tháng' : 'Nhóm 18–24 tháng'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-950">
            {activity.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onViewLessonPlan && (
            <button
              type="button"
              onClick={onViewLessonPlan}
              className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-black text-xs sm:text-sm rounded-2xl border-2 border-emerald-300 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              title="Xem giáo án chi tiết bảng 2 cột chuẩn Bộ GD&ĐT"
            >
              <span>📚</span>
              <span>Xem giáo án (Bảng 2 cột)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleStartActivity}
            className="py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-base sm:text-lg rounded-2xl shadow-md border-2 border-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>▶ Bắt đầu hoạt động</span>
          </button>
        </div>
      </div>

      {/* 2. PEDAGOGICAL BREAKDOWN SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-5 text-sm">
        {/* MỤC TIÊU GIÁO DỤC */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
          <div className="flex items-center gap-2 font-black text-amber-950 mb-2">
            <Target className="w-4 h-4 text-amber-600" />
            <span>Mục Tiêu Hoạt Động:</span>
          </div>
          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium">
            {activity.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CHUẨN BỊ */}
        <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200">
          <div className="flex items-center gap-2 font-black text-sky-950 mb-2">
            <Package className="w-4 h-4 text-sky-600" />
            <span>Chuẩn Bị Của Cô & Trẻ:</span>
          </div>
          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium">
            {activity.preparation.map((prep, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-sky-600 font-bold mt-0.5">•</span>
                <span>{prep}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* LỜI CÔ HƯỚNG DẪN & NỘI DUNG MÀN HÌNH */}
        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
          <div className="flex items-center gap-2 font-black text-emerald-950 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Lời Cô Hướng Dẫn & Màn Hình:</span>
          </div>
          <p className="text-sm font-black text-emerald-900 bg-white/80 p-2.5 rounded-xl border border-emerald-300 mb-2">
            “{activity.teacherPrompt}”
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Hiển thị:</span>
            <span className="font-bold text-slate-800">
              {activity.choices.length} hình ({activity.choices.map((c) => c.name).join(' + ')})
            </span>
          </div>
        </div>

        {/* TIÊU CHÍ QUAN SÁT */}
        <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200">
          <div className="flex items-center gap-2 font-black text-purple-950 mb-2">
            <Eye className="w-4 h-4 text-purple-600" />
            <span>Tiêu Chí Quan Sát Của Cô:</span>
          </div>
          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 font-medium">
            {activity.observationCriteria.map((cri, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-purple-600 font-bold mt-0.5">•</span>
                <span>{cri}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. GỢI Ý MỞ RỘNG NGOÀI ĐỜI THỰC (🌱 RẤT QUAN TRỌNG) */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 p-4 rounded-2xl border-2 border-emerald-300">
        <div className="flex items-center gap-2 font-black text-emerald-950 mb-1.5">
          <span className="text-xl">🌱</span>
          <span className="text-sm sm:text-base">Gợi Ý Mở Rộng Ngoài Đời Thực (Chuyển Sang Đồ Vật Thật):</span>
        </div>
        <ul className="space-y-1 text-xs sm:text-sm text-emerald-950 font-semibold pl-6 list-disc">
          {activity.realLifeExtension.map((ext, i) => (
            <li key={i}>{ext}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
