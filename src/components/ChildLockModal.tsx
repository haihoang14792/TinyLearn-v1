import React, { useState, useEffect } from 'react';
import { Lock, X, Check } from 'lucide-react';

interface ChildLockModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export const ChildLockModal: React.FC<ChildLockModalProps> = ({ isOpen, onSuccess, onClose }) => {
  const [numA, setNumA] = useState(2);
  const [numB, setNumB] = useState(3);
  const [userAnswer, setUserAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const a = Math.floor(Math.random() * 5) + 2;
      const b = Math.floor(Math.random() * 4) + 1;
      setNumA(a);
      setNumB(b);
      setUserAnswer('');
      setErrorMsg(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const correctAnswer = numA + numB;

  const handleDigit = (d: number) => {
    const nextVal = userAnswer + d.toString();
    setUserAnswer(nextVal);
    if (parseInt(nextVal, 10) === correctAnswer) {
      onSuccess();
    } else if (nextVal.length >= correctAnswer.toString().length) {
      setErrorMsg(true);
      setTimeout(() => {
        setUserAnswer('');
        setErrorMsg(false);
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-4 border-amber-200 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700">
            <Lock className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-1">Góc Dành Cho Giáo Viên</h3>
        <p className="text-sm text-slate-600 mb-4">
          Xác nhận phụ huynh/giáo viên để vào phần cài đặt và tạo bài học:
        </p>

        <div className="bg-amber-50 rounded-2xl py-3 px-4 border border-amber-200 mb-5">
          <span className="text-2xl font-black text-amber-900 tracking-wider">
            {numA} + {numB} = ?
          </span>
          <div className="mt-1 text-xs text-amber-800">
            {errorMsg ? 'Chưa đúng, thử lại nha' : 'Nhập kết quả bên dưới'}
          </div>
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-14 rounded-2xl bg-slate-100 hover:bg-amber-100 active:bg-amber-200 text-xl font-bold text-slate-800 transition-all active:scale-90 border-2 border-slate-200/80 shadow-xs"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setUserAnswer('')}
            className="h-14 rounded-2xl bg-rose-50 text-rose-600 font-semibold text-sm active:scale-90 border-2 border-rose-200"
          >
            Xoá
          </button>
          <button
            onClick={() => onSuccess()}
            className="h-14 rounded-2xl bg-emerald-500 text-white font-bold flex items-center justify-center active:scale-90 border-2 border-emerald-600"
            title="Bỏ qua (chế độ demo)"
          >
            <Check className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
