import React from 'react';
import { AgeGroup } from '../../data/activityTypes.ts';
import { Baby, Sparkles } from 'lucide-react';

interface AgeSelectorProps {
  selectedAge: AgeGroup;
  onSelectAge: (age: AgeGroup) => void;
}

export const AgeSelector: React.FC<AgeSelectorProps> = ({
  selectedAge,
  onSelectAge,
}) => {
  return (
    <div className="w-full select-none">
      <div className="flex items-center gap-2 mb-2.5">
        <Baby className="w-5 h-5 text-amber-600" />
        <span className="text-sm sm:text-base font-black text-slate-800">
          Chọn Nhóm Tuổi Nhà Trẻ:
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 12 - 18 THÁNG */}
        <button
          type="button"
          onClick={() => onSelectAge('12-18')}
          className={`p-4 rounded-2xl border-3 text-left transition-all cursor-pointer flex items-center justify-between ${
            selectedAge === '12-18'
              ? 'bg-amber-100/90 border-amber-500 shadow-md scale-[1.01] ring-2 ring-amber-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg text-amber-950">
                12–18 tháng
              </span>
              {selectedAge === '12-18' && (
                <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                  Đang chọn
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Chủ yếu 2 hình lớn, câu lệnh 2–5 từ, tập nghe, nhìn, chỉ, chạm và bắt chước.
            </p>
          </div>
          <span className="text-3xl ml-3">🍼</span>
        </button>

        {/* 18 - 24 THÁNG */}
        <button
          type="button"
          onClick={() => onSelectAge('18-24')}
          className={`p-4 rounded-2xl border-3 text-left transition-all cursor-pointer flex items-center justify-between ${
            selectedAge === '18-24'
              ? 'bg-amber-100/90 border-amber-500 shadow-md scale-[1.01] ring-2 ring-amber-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg text-amber-950">
                18–24 tháng
              </span>
              {selectedAge === '18-24' && (
                <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                  Đang chọn
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              2–3 hình, câu ngắn 4–8 từ, tập nói cụm từ, nhận biết và vận động phối hợp.
            </p>
          </div>
          <span className="text-3xl ml-3">🧸</span>
        </button>
      </div>
    </div>
  );
};
