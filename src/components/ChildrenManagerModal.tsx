import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Users,
  Edit2,
  Check,
  UserCheck,
  Calendar,
  Sparkles,
  Heart,
} from 'lucide-react';
import { ChildProfile } from '../types.ts';

interface ChildrenManagerModalProps {
  isOpen: boolean;
  childrenList: ChildProfile[];
  activeChildId: string | null;
  onClose: () => void;
  onSelectActiveChild: (childId: string | null) => void;
  onSaveChildren: (list: ChildProfile[]) => void;
}

export const ChildrenManagerModal: React.FC<ChildrenManagerModalProps> = ({
  isOpen,
  childrenList,
  activeChildId,
  onClose,
  onSelectActiveChild,
  onSaveChildren,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('2025-01-01');
  const [className, setClassName] = useState('Nhà trẻ D1 (12–18m)');
  const [avatarEmoji, setAvatarEmoji] = useState('🦁');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const newChild: ChildProfile = {
      id: `child_${Date.now()}`,
      fullName: fullName.trim(),
      birthDate,
      className,
      avatarEmoji,
      avatarBgColor: ['#FEF3C7', '#FCE7F3', '#E0F2FE', '#DCFCE7', '#EDE9FE'][Math.floor(Math.random() * 5)],
      notes: notes.trim(),
      createdAt: Date.now(),
    };

    onSaveChildren([newChild, ...childrenList]);
    setFullName('');
    setNotes('');
    setIsAdding(false);
  };

  const handleDeleteChild = (id: string) => {
    if (window.confirm('Cô có chắc chắn muốn xóa hồ sơ bé này không?')) {
      onSaveChildren(childrenList.filter((c) => c.id !== id));
      if (activeChildId === id) {
        onSelectActiveChild(null);
      }
    }
  };

  const emojiList = ['🦁', '🐰', '🐻', '🐱', '🐶', '🐼', '🐨', '🦊', '🐯', '🐧', '🐥', '🐵'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-4xl shadow-2xl border-4 border-pink-300 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200 border-b border-pink-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-pink-800 flex items-center justify-center font-black text-xl shadow-xs">
              👶
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-pink-950">
                Hồ Sơ & Danh Sách Trẻ (12–24 Tháng)
              </h2>
              <p className="text-xs font-bold text-pink-900/80">
                Ghi nhận tiến bộ cá nhân • Bảo mật thông tin trẻ nhỏ
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

        {/* TOOLBAR */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-600">
            Tổng số trẻ: <strong className="text-pink-700">{childrenList.length} bé</strong>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-3.5 py-1.5 bg-pink-500 hover:bg-pink-600 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAdding ? 'Hủy thêm' : 'Thêm hồ sơ bé'}</span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* ADD CHILD FORM */}
          {isAdding && (
            <form onSubmit={handleAddChild} className="p-4 bg-pink-50/70 rounded-3xl border-2 border-pink-200 space-y-3.5 animate-in fade-in duration-200">
              <h4 className="font-black text-sm text-pink-950">Thêm hồ sơ bé mới vào lớp:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Họ tên & Tên gọi ở nhà:</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Minh An (Bé Bon)"
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-pink-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ngày sinh:</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-pink-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nhóm lớp:</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-white border border-pink-200 rounded-xl"
                  >
                    <option value="Nhà trẻ D1 (12–18m)">Nhà trẻ D1 (12–18 tháng)</option>
                    <option value="Nhà trẻ D2 (18–24m)">Nhà trẻ D2 (18–24 tháng)</option>
                    <option value="Lớp Mầm non tư thục">Lớp Mầm non tư thục</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Biểu tượng ngộ nghĩnh của bé:</label>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                    {emojiList.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setAvatarEmoji(em)}
                        className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center border transition-all ${
                          avatarEmoji === em ? 'bg-pink-200 border-pink-500 scale-110' : 'bg-white border-slate-200'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ghi chú quan sát ban đầu của cô:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Bé thích bạn Mèo, đã biết gọi tiếng ba mẹ..."
                  className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-white border border-pink-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-pink-500 hover:bg-pink-600 text-white font-black text-xs rounded-xl shadow-xs"
                >
                  Lưu hồ sơ
                </button>
              </div>
            </form>
          )}

          {/* CHILDREN LIST */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {childrenList.map((child) => {
              const isSelected = activeChildId === child.id;
              return (
                <div
                  key={child.id}
                  className={`p-4 rounded-3xl border-2 transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-pink-50/90 border-pink-400 ring-4 ring-pink-200 shadow-sm'
                      : 'bg-white border-slate-100 hover:border-pink-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0"
                      style={{ backgroundColor: child.avatarBgColor || '#FEF3C7' }}
                    >
                      {child.avatarEmoji}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-sm text-slate-900">{child.fullName}</h4>
                        {isSelected && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-pink-500 text-white">
                            Đang chơi
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-pink-800">{child.className}</div>
                      {child.notes && (
                        <p className="text-xs text-slate-500 line-clamp-2 italic">
                          &ldquo;{child.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectActiveChild(isSelected ? null : child.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-pink-500 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-pink-100 text-slate-700'
                      }`}
                    >
                      {isSelected ? '✓ Đang chọn' : 'Chọn bé này'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteChild(child.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                      title="Xóa hồ sơ bé"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
