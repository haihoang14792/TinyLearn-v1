import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  BarChart3,
  Award,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Clock,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { TopicProgressStat, ChildProfile, ChildActivityResult } from '../types.ts';
import { resetProgressStats } from '../utils/storage.ts';

interface ReportsModalProps {
  isOpen: boolean;
  progressStats: Record<string, TopicProgressStat>;
  childrenList: ChildProfile[];
  activityResults: ChildActivityResult[];
  onClose: () => void;
  onResetStats: () => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  progressStats,
  childrenList,
  activityResults,
  onClose,
  onResetStats,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'children' | 'topics'>('overview');

  if (!isOpen) return null;

  const totalAttempts = Object.values(progressStats).reduce(
    (acc, cur) => acc + (cur.correctCount || 0) + (cur.wrongCount || 0),
    0
  );
  const totalCorrect = Object.values(progressStats).reduce(
    (acc, cur) => acc + (cur.correctCount || 0),
    0
  );
  const totalRounds = Object.values(progressStats).reduce(
    (acc, cur) => acc + (cur.completedRounds || 0),
    0
  );

  const accuracyPercent =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-4xl shadow-2xl border-4 border-teal-300 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-300 border-b border-teal-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-teal-800 flex items-center justify-center font-black text-xl shadow-xs">
              📊
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Báo Cáo & Nhật Ký Phát Triển Trẻ
              </h2>
              <p className="text-xs font-bold text-teal-950/80">
                Theo dõi phản xạ thính giác, ngôn ngữ & mức độ cần gợi ý
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB BAR */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tổng quan toàn lớp
            </button>
            <button
              onClick={() => setActiveTab('children')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'children'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tiến bộ từng bé ({childrenList.length})
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'topics'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Chủ đề & Đối tượng
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In báo cáo</span>
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* METRIC CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 bg-teal-50 rounded-3xl border border-teal-200">
                  <div className="text-xs font-bold text-teal-800">Lượt hoàn thành bài</div>
                  <div className="text-2xl font-black text-teal-950 mt-1">{totalRounds}</div>
                  <div className="text-[10px] text-teal-700">Các vòng chơi trọn vẹn</div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-3xl border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-800">Tỉ lệ phản hồi đúng</div>
                  <div className="text-2xl font-black text-emerald-950 mt-1">{accuracyPercent}%</div>
                  <div className="text-[10px] text-emerald-700">Nhận biết chính xác</div>
                </div>

                <div className="p-4 bg-amber-50 rounded-3xl border border-amber-200">
                  <div className="text-xs font-bold text-amber-800">Tổng lượt tương tác</div>
                  <div className="text-2xl font-black text-amber-950 mt-1">{totalAttempts}</div>
                  <div className="text-[10px] text-amber-700">Chạm và khám phá</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-3xl border border-purple-200">
                  <div className="text-xs font-bold text-purple-800">Số trẻ tham gia</div>
                  <div className="text-2xl font-black text-purple-950 mt-1">{childrenList.length}</div>
                  <div className="text-[10px] text-purple-700">Đã lưu hồ sơ theo dõi</div>
                </div>
              </div>

              {/* TEACHER EVALUATION SUMMARY */}
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-2">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <span>💡</span>
                  <span>Nhận định sư phạm dành cho giáo viên:</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Trẻ độ tuổi 12–24 tháng tiếp thu rất tốt thông qua <strong>kết hợp âm thanh tượng thanh và hình ảnh lớn</strong>.
                  Tính năng <strong>viền sáng nhấp nháy tự động sau lần lặp 2</strong> đã hỗ trợ các trẻ nhút nhát hoàn thành bài học một cách tự tin, không bị cảm giác thất bại hay áp lực.
                </p>
              </div>

              {/* RECENT ACTIVITY SESSIONS */}
              <div className="space-y-3">
                <h4 className="font-black text-sm text-slate-900">Nhật ký hoạt động gần đây:</h4>
                {activityResults.length > 0 ? (
                  <div className="space-y-2">
                    {activityResults.slice(0, 5).map((act) => (
                      <div
                        key={act.id}
                        className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black">
                            👶
                          </span>
                          <div>
                            <span className="font-black text-slate-900">{act.childName}</span>
                            <span className="text-slate-400 mx-1">•</span>
                            <span className="text-slate-600 font-bold">{act.gameTitle}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-emerald-700 font-bold">
                            ✓ Đúng: {act.correctCount}
                          </span>
                          <span className="text-slate-400">
                            {new Date(act.playedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                    Chưa có lượt chơi nào được gán tên bé. Cô hãy chọn một bé trong mục &ldquo;👶 Hồ Sơ Trẻ&rdquo; trước khi chơi để tự động ghi nhật ký nhé!
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'children' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600 font-medium">
                Theo dõi sự tiến bộ cá nhân của từng trẻ trong lớp (không so sánh hay chấm điểm cạnh tranh):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {childrenList.map((child) => (
                  <div
                    key={child.id}
                    className="p-4 bg-white rounded-3xl border-2 border-slate-100 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
                        style={{ backgroundColor: child.avatarBgColor || '#FEF3C7' }}
                      >
                        {child.avatarEmoji}
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900">{child.fullName}</h4>
                        <span className="text-[11px] font-bold text-teal-700">{child.className}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                      <p><strong>Điểm mạnh: </strong>Phản ứng nhanh với tiếng kêu động vật, nhận biết màu sắc.</p>
                      <p><strong>Cần hỗ trợ: </strong>Khuyến khích bé tập nói từ đơn 2 âm tiết.</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'topics' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600 font-medium">
                Chi tiết mức độ nhận biết theo từng chủ đề và đối tượng:
              </div>
              <div className="space-y-3">
                {Object.values(progressStats).map((stat) => (
                  <div
                    key={stat.topicId}
                    className="p-4 bg-white rounded-3xl border border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-slate-900">{stat.topicTitle}</h4>
                      <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                        {stat.completedRounds} vòng chơi hoàn thành
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                      {Object.values(stat.itemStats || {}).map((it) => (
                        <div key={it.name} className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                          <span className="font-bold text-slate-800">{it.name}</span>
                          <span className="text-emerald-700 font-black">✓ {it.correct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {Object.keys(progressStats).length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-500 font-medium">
                    Chưa có thống kê bài học nào. Khi bé chơi trò chơi, dữ liệu sẽ tự động xuất hiện tại đây!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              if (window.confirm('Cô có chắc chắn muốn đặt lại toàn bộ thống kê để bắt đầu buổi quan sát mới?')) {
                resetProgressStats();
                onResetStats();
              }
            }}
            className="text-slate-400 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại thống kê</span>
          </button>
          <span className="text-slate-400 font-medium">
            Hệ thống báo cáo sư phạm TinyLearn mầm non
          </span>
        </div>
      </div>
    </div>
  );
};
