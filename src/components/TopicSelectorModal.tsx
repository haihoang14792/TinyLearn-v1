import React from 'react';
import { X, Plus, Sparkles, Check, Trash2 } from 'lucide-react';
import { TopicGame } from '../types.ts';

interface TopicSelectorModalProps {
  isOpen: boolean;
  games: TopicGame[];
  currentGameId: string;
  onSelectGame: (game: TopicGame) => void;
  onCreateNewTopic: () => void;
  onDeleteGame?: (gameId: string) => void;
  onClose: () => void;
}

export const TopicSelectorModal: React.FC<TopicSelectorModalProps> = ({
  isOpen,
  games,
  currentGameId,
  onSelectGame,
  onCreateNewTopic,
  onDeleteGame,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-4xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border-4 border-amber-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl">
              🎈
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Chọn Chủ Đề Cho Bé</h3>
              <p className="text-sm font-semibold text-slate-500">Các bài học nhận biết dành cho 12–24 tháng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95 transition-all"
            aria-label="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Topics List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {games.map((g) => {
            const isSelected = g.id === currentGameId;
            return (
              <button
                key={g.id}
                onClick={() => {
                  onSelectGame(g);
                  onClose();
                }}
                className={`relative flex flex-col text-left p-5 rounded-3xl border-3 transition-all active:scale-98 ${
                  isSelected
                    ? 'bg-amber-50/80 border-amber-500 ring-4 ring-amber-200 shadow-md'
                    : 'bg-slate-50/70 hover:bg-amber-50/40 border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    {g.topic}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                    {onDeleteGame && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Cô có chắc chắn muốn xóa bài học "${g.title}" vì tạo sai không?`)) {
                            onDeleteGame(g.id);
                          }
                        }}
                        title="Xóa bài học này"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xl font-black text-slate-900 mb-1">
                  {g.title}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                  {g.description || 'Bài học nhận biết âm thanh và hình ảnh.'}
                </p>

                {/* Items preview preview thumbnails */}
                <div className="flex items-center gap-2 mt-auto">
                  {g.items.slice(0, 4).map((it) => (
                    <div
                      key={it.id}
                      className="w-9 h-9 rounded-xl border border-slate-200 overflow-hidden bg-white p-1 flex items-center justify-center shadow-2xs"
                      title={it.name}
                    >
                      <img src={it.imageUrl} alt={it.name} className="w-full h-full object-contain" />
                    </div>
                  ))}
                  {g.items.length > 4 && (
                    <span className="text-xs font-bold text-slate-500">
                      +{g.items.length - 4}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button: Create new topic */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={() => {
              onClose();
              onCreateNewTopic();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-base rounded-2xl shadow-sm border-2 border-amber-500 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo Chủ Đề Mới (Giáo Viên)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base rounded-2xl active:scale-95 transition-all"
          >
            Bắt đầu chơi
          </button>
        </div>
      </div>
    </div>
  );
};
