import React, { useState } from 'react';
import { X, QrCode, Tv, Copy, Check, ExternalLink, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { TopicGame } from '../types.ts';

interface QRCodeModalProps {
  isOpen: boolean;
  game: TopicGame | null;
  onClose: () => void;
  onPlayTouchTV: (game: TopicGame) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  game,
  onClose,
  onPlayTouchTV,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !game) return null;

  const currentUrl = window.location.origin + window.location.pathname + `?gameId=${game.id}&mode=tv`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-4xl shadow-2xl border-4 border-amber-300 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-400 to-yellow-300 border-b border-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-6 h-6 text-amber-950" />
            <h3 className="font-black text-lg text-amber-950">Mã QR Mở Trò Chơi</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 text-center space-y-5">
          <div>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              {game.ageRange} • {game.items.length} câu hỏi
            </span>
            <h4 className="text-xl font-black text-slate-900 mt-2">{game.title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Dùng iPad, điện thoại hoặc camera Smart TV quét mã bên dưới để mở ngay
            </p>
          </div>

          {/* QR CODE CONTAINER */}
          <div className="p-6 bg-amber-50/70 rounded-3xl border-2 border-dashed border-amber-300 flex items-center justify-center inline-block mx-auto shadow-inner">
            <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-white">
              <QRCodeSVG
                value={currentUrl}
                size={210}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-2.5">
            <button
              onClick={() => {
                onClose();
                onPlayTouchTV(game);
              }}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Tv className="w-4 h-4" />
              <span>Khởi động chế độ TV cảm ứng ngay</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'Đã sao chép liên kết!' : 'Sao chép liên kết bài học'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
