import React, { useState, useEffect } from 'react';
import { Trash2, Download, ArrowLeft, Calendar, Award, Clock } from 'lucide-react';

export interface SessionHistoryRecord {
  id: string;
  date: string; // YYYY-MM-DD HH:mm
  topicName: string;
  difficulty: string; // Dễ (2 hình) | Trung bình (3 hình) | Khó (4 hình)
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  durationFormatted: string;
  timestamp: number;
}

const STORAGE_KEY_SESSION_HISTORY = 'tinylearn_session_history_v1';

export function loadSessionHistory(): SessionHistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION_HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load session history:', e);
  }
  return [];
}

export function saveSessionHistoryRecord(record: SessionHistoryRecord) {
  try {
    const history = loadSessionHistory();
    history.unshift(record);
    // Keep last 100 sessions
    const trimmed = history.slice(0, 100);
    localStorage.setItem(STORAGE_KEY_SESSION_HISTORY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save session history:', e);
  }
}

interface HistoryScreenProps {
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const [history, setHistory] = useState<SessionHistoryRecord[]>(() => loadSessionHistory());

  useEffect(() => {
    setHistory(loadSessionHistory());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Cô có chắc chắn muốn xóa toàn bộ lịch sử các lượt chơi không?')) {
      localStorage.removeItem(STORAGE_KEY_SESSION_HISTORY);
      setHistory([]);
    }
  };

  // Export to CSV with UTF-8 BOM for Microsoft Excel compatibility
  const handleExportCSV = () => {
    if (history.length === 0) {
      alert('Chưa có dữ liệu lượt chơi để xuất file.');
      return;
    }

    const headers = [
      'Ngày giờ',
      'Chủ đề',
      'Mức độ',
      'Số câu',
      'Câu đúng',
      'Tỷ lệ (%)',
      'Thời gian hoàn thành',
    ];

    const rows = history.map((item) => [
      `"${item.date}"`,
      `"${item.topicName}"`,
      `"${item.difficulty}"`,
      item.totalQuestions,
      item.correctCount,
      `${item.percentage}%`,
      `"${item.durationFormatted}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `tinylearn_lich_su_hoc_tap_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 animate-fadeIn">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 bg-white hover:bg-slate-100 rounded-2xl border-2 border-slate-200 shadow-xs cursor-pointer active:scale-95 transition-all text-slate-700"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-950 flex items-center gap-2">
              <span>📊</span>
              <span>Bảng Kết Quả Lượt Chơi Của Bé</span>
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Lưu trữ kết quả các bài học trên lớp để giáo viên theo dõi và báo cáo
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={history.length === 0}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs border border-emerald-600 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Xuất CSV (Excel)</span>
          </button>

          <button
            type="button"
            onClick={handleClearHistory}
            disabled={history.length === 0}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 font-bold text-xs sm:text-sm rounded-xl border border-rose-200 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa lịch sử</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      {history.length === 0 ? (
        <div className="bg-white/80 rounded-3xl border-2 border-dashed border-amber-200 p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mb-3">
            📝
          </div>
          <h3 className="font-black text-lg text-slate-700 mb-1">Chưa có lượt chơi nào</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-4">
            Khi bé hoàn thành bài học, kết quả sẽ tự động lưu lại tại bảng này.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-xl text-sm cursor-pointer"
          >
            Bắt đầu bài học ngay
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-amber-50/80 text-amber-950 font-black border-b border-amber-200">
                <tr>
                  <th className="p-3.5 whitespace-nowrap">Ngày & Giờ</th>
                  <th className="p-3.5 whitespace-nowrap">Chủ đề</th>
                  <th className="p-3.5 whitespace-nowrap">Mức độ</th>
                  <th className="p-3.5 text-center whitespace-nowrap">Số câu</th>
                  <th className="p-3.5 text-center whitespace-nowrap">Câu đúng</th>
                  <th className="p-3.5 text-center whitespace-nowrap">Tỷ lệ</th>
                  <th className="p-3.5 whitespace-nowrap">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-3.5 text-slate-500 text-xs flex items-center gap-1.5 whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{record.date}</span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {record.topicName}
                    </td>
                    <td className="p-3.5 text-xs text-slate-600 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                        {record.difficulty}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-bold">{record.totalQuestions}</td>
                    <td className="p-3.5 text-center font-black text-emerald-600">
                      {record.correctCount}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-black text-xs ${
                          record.percentage >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : record.percentage >= 60
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {record.percentage}%
                      </span>
                    </td>
                    <td className="p-3.5 text-xs text-slate-500 flex items-center gap-1 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{record.durationFormatted}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
