import React, { useState } from 'react';
import { PreschoolActivity } from '../../data/activityTypes.ts';
import { saveObservationRecord } from '../../data/activitiesManager.ts';
import { Save, ArrowRight, Home, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import { audioEngine } from '../../utils/audio.ts';

interface ObservationFormProps {
  activity: PreschoolActivity;
  onNextActivity: () => void;
  onGoHome: () => void;
  onOpenTeacherMenu: () => void;
}

export const ObservationForm: React.FC<ObservationFormProps> = ({
  activity,
  onNextActivity,
  onGoHome,
  onOpenTeacherMenu,
}) => {
  const [participation, setParticipation] = useState<
    'Hứng thú tham gia' | 'Tham gia khi có hỗ trợ' | 'Chưa hứng thú'
  >('Hứng thú tham gia');

  const [execution, setExecution] = useState<
    'Tự thực hiện được' | 'Thực hiện khi có hỗ trợ' | 'Cần thêm cơ hội trải nghiệm'
  >('Tự thực hiện được');

  const [notes, setNotes] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveObservation = async () => {
    const now = new Date();
    const dateStr = `${now.toLocaleDateString('vi-VN')} ${now
      .toLocaleTimeString('vi-VN')
      .slice(0, 5)}`;

    await saveObservationRecord({
      id: `obs_${Date.now()}`,
      date: dateStr,
      ageGroup: activity.ageGroup,
      activityId: activity.id,
      activityTitle: activity.title,
      topic: activity.topic,
      domainName: activity.domain.join(', '),
      participationLevel: participation,
      executionAbility: execution,
      teacherNotes: notes.trim(),
      timestamp: Date.now(),
    });

    audioEngine.playSuccessChime();
    setSavedSuccess(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 animate-fadeIn select-none">
      <div className="bg-white rounded-3xl border-3 border-amber-300 shadow-xl p-6 sm:p-8">
        {/* TOP STATUS */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mx-auto mb-2 shadow-xs">
            🌸
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-950">
            Hoạt Động Hoàn Thành
          </h2>
          <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
            Bài: <span className="text-amber-900 font-black">{activity.title}</span> ({activity.ageGroup === '12-18' ? 'Nhà trẻ 12–18m' : 'Nhà trẻ 18–24m'})
          </p>
        </div>

        {/* 🌱 GỢI Ý MỞ RỘNG NGOÀI ĐỜI THỰC (CHUYỂN SANG ĐỒ VẬT THẬT) */}
        <div className="bg-emerald-50 rounded-2xl border-2 border-emerald-300 p-4 mb-6">
          <div className="flex items-center gap-2 font-black text-emerald-950 mb-2">
            <span className="text-xl">🌱</span>
            <span className="text-sm sm:text-base">Gợi Ý Mở Rộng Ngoài Đời Thực (Chuyển Sang Đồ Vật Thật):</span>
          </div>
          <ul className="text-xs sm:text-sm text-emerald-950 font-semibold space-y-1 pl-6 list-disc">
            {activity.realLifeExtension.map((ext, i) => (
              <li key={i}>{ext}</li>
            ))}
          </ul>
        </div>

        {/* BẢNG QUAN SÁT SƯ PHẠM DÀNH CHO CÔ */}
        <div className="space-y-4 mb-6 pt-2 border-t border-slate-200">
          <h3 className="font-black text-sm sm:text-base text-slate-800 flex items-center gap-2">
            <span>📝</span>
            <span>Ghi Nhận Quan Sát Sư Phạm Của Giáo Viên:</span>
          </h3>

          {/* 1. MỨC ĐỘ THAM GIA */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              Mức độ tham gia của trẻ:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                'Hứng thú tham gia',
                'Tham gia khi có hỗ trợ',
                'Chưa hứng thú',
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setParticipation(opt as any)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-black cursor-pointer transition-all ${
                    participation === opt
                      ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 2. KHẢ NĂNG THỰC HIỆN */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              Khả năng thực hiện:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                'Tự thực hiện được',
                'Thực hiện khi có hỗ trợ',
                'Cần thêm cơ hội trải nghiệm',
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setExecution(opt as any)}
                  className={`p-2.5 rounded-xl border-2 text-xs font-black cursor-pointer transition-all ${
                    execution === opt
                      ? 'bg-emerald-400 border-emerald-500 text-emerald-950 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 3. GHI CHÚ CỦA CÔ */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">
              Ghi chú của giáo viên (ví dụ: Bé nhận biết mèo tốt, còn nhầm chó):
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập nhận xét cụ thể để theo dõi sự phát triển của trẻ..."
              rows={2}
              className="w-full p-3 rounded-xl border-2 border-slate-200 text-xs sm:text-sm focus:border-amber-400 focus:outline-hidden"
            />
          </div>

          {/* SAVE BUTTON */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleSaveObservation}
              disabled={savedSuccess}
              className={`py-2.5 px-5 rounded-xl font-black text-xs sm:text-sm shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all ${
                savedSuccess
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-400 hover:bg-amber-500 text-amber-950 border border-amber-500'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đã lưu vào Nhật ký hoạt động!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu vào Nhật ký hoạt động</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenTeacherMenu}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Xem sổ nhật ký
            </button>
          </div>
        </div>

        {/* 3 ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onNextActivity}
            className="flex-1 py-3 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-md border-2 border-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Hoạt động tiếp theo</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenTeacherMenu}
            className="flex-1 py-3 px-5 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-sm sm:text-base rounded-2xl border-2 border-amber-300 shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>Chọn hoạt động khác</span>
          </button>

          <button
            type="button"
            onClick={onGoHome}
            className="py-3 px-5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm sm:text-base rounded-2xl border-2 border-slate-200 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Trang chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
