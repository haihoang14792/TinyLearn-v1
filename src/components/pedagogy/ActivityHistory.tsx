import React, { useState, useEffect } from 'react';
import { ActivityObservationRecord } from '../../data/activityTypes.ts';
import {
  loadObservationRecords,
  deleteObservationRecord,
  clearAllObservationRecords,
} from '../../data/activitiesManager.ts';
import { ArrowLeft, Download, Trash2, Calendar, BookOpen, Baby, FileText } from 'lucide-react';

interface ActivityHistoryProps {
  onBack: () => void;
}

export const ActivityHistory: React.FC<ActivityHistoryProps> = ({ onBack }) => {
  const [records, setRecords] = useState<ActivityObservationRecord[]>(() =>
    loadObservationRecords()
  );

  useEffect(() => {
    setRecords(loadObservationRecords());
  }, []);

  const handleClear = () => {
    if (window.confirm('Cô có chắc chắn muốn xóa toàn bộ nhật ký quan sát hoạt động không?')) {
      clearAllObservationRecords();
      setRecords([]);
    }
  };

  const handleDeleteOne = (id: string) => {
    deleteObservationRecord(id);
    setRecords(loadObservationRecords());
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      alert('Chưa có bản ghi nhật ký nào để xuất file.');
      return;
    }

    const headers = [
      'Thời gian',
      'Nhóm tuổi',
      'Tên hoạt động',
      'Chủ đề',
      'Mức độ tham gia',
      'Khả năng thực hiện',
      'Ghi chú của giáo viên',
    ];

    const rows = records.map((r) => [
      `"${r.date}"`,
      `"${r.ageGroup === '12-18' ? '12–18 tháng' : '18–24 tháng'}"`,
      `"${r.activityTitle}"`,
      `"${r.topic}"`,
      `"${r.participationLevel}"`,
      `"${r.executionAbility}"`,
      `"${(r.teacherNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `tinylearn_nhat_ky_hoat_dong_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 animate-fadeIn select-none">
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
              <span>📋</span>
              <span>Nhật Ký Quan Sát Hoạt Động (Giáo Viên)</span>
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              Ghi nhận mức độ hứng thú & khả năng tương tác của trẻ nhà trẻ (không chấm điểm)
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={records.length === 0}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs border border-emerald-600 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Xuất CSV (Excel)</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={records.length === 0}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 font-bold text-xs sm:text-sm rounded-xl border border-rose-200 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa nhật ký</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      {records.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-amber-200 p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mb-3">
            📝
          </div>
          <h3 className="font-black text-lg text-slate-700 mb-1">
            Chưa có ghi nhận hoạt động nào
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mb-4">
            Sau khi trẻ tham gia hoạt động, cô có thể ghi nhận mức độ tham gia và nhận xét của mình vào đây.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-xl text-sm cursor-pointer"
          >
            Bắt đầu hoạt động cho trẻ
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-amber-50/80 text-amber-950 font-black border-b border-amber-200">
                <tr>
                  <th className="p-3.5 whitespace-nowrap">Thời gian</th>
                  <th className="p-3.5 whitespace-nowrap">Độ tuổi</th>
                  <th className="p-3.5 whitespace-nowrap">Tên hoạt động</th>
                  <th className="p-3.5 whitespace-nowrap">Mức độ tham gia</th>
                  <th className="p-3.5 whitespace-nowrap">Khả năng thực hiện</th>
                  <th className="p-3.5">Ghi chú của cô</th>
                  <th className="p-3.5 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-3.5 text-slate-500 text-xs flex items-center gap-1.5 whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      <span>{r.date}</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                        {r.ageGroup === '12-18' ? '12–18m' : '18–24m'}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {r.activityTitle}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
                          r.participationLevel === 'Hứng thú tham gia'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.participationLevel === 'Tham gia khi có hỗ trợ'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.participationLevel}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
                          r.executionAbility === 'Tự thực hiện được'
                            ? 'bg-teal-100 text-teal-800'
                            : r.executionAbility === 'Thực hiện khi có hỗ trợ'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {r.executionAbility}
                      </span>
                    </td>
                    <td className="p-3.5 text-xs text-slate-600 max-w-xs">
                      {r.teacherNotes || '—'}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteOne(r.id)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                        title="Xóa bản ghi này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
