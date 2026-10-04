import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, CheckCircle2, RotateCcw, Puzzle, Award, Check } from 'lucide-react';
import { TopicItem } from '../../types.ts';
import { audioEngine } from '../../utils/audio.ts';
import { hapticsEngine } from '../../utils/haptics.ts';

export type PieceCount = 2 | 3 | 4 | 6;

interface JigsawPuzzlePlayModeProps {
  targetItem: TopicItem;
  initialPieceCount?: PieceCount;
  onCompleted: () => void;
  enableHaptics?: boolean;
}

interface PuzzlePieceData {
  id: number;
  row: number;
  col: number;
  totalRows: number;
  totalCols: number;
  placed: boolean;
}

export const JigsawPuzzlePlayMode: React.FC<JigsawPuzzlePlayModeProps> = ({
  targetItem,
  initialPieceCount = 4,
  onCompleted,
  enableHaptics = true,
}) => {
  const [pieceCount, setPieceCount] = useState<PieceCount>(initialPieceCount);
  const [pieces, setPieces] = useState<PuzzlePieceData[]>([]);
  const [unplacedOrder, setUnplacedOrder] = useState<number[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [isAllCompleted, setIsAllCompleted] = useState(false);
  const [wobbleSlotId, setWobbleSlotId] = useState<number | null>(null);

  const boardSlotRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Generate grid dimensions according to pieceCount
  const getGridConfig = (count: PieceCount): { rows: number; cols: number } => {
    switch (count) {
      case 2:
        return { rows: 1, cols: 2 };
      case 3:
        return { rows: 1, cols: 3 };
      case 4:
        return { rows: 2, cols: 2 };
      case 6:
        return { rows: 2, cols: 3 };
      default:
        return { rows: 2, cols: 2 };
    }
  };

  // Initialize or reset puzzle pieces
  const initPuzzle = (count: PieceCount) => {
    const { rows, cols } = getGridConfig(count);
    const newPieces: PuzzlePieceData[] = [];
    let idx = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        newPieces.push({
          id: idx,
          row: r,
          col: c,
          totalRows: rows,
          totalCols: cols,
          placed: false,
        });
        idx++;
      }
    }

    setPieces(newPieces);
    // Shuffle the unplaced piece IDs for the tray
    const shuffled = newPieces.map((p) => p.id).sort(() => Math.random() - 0.5);
    setUnplacedOrder(shuffled);
    setSelectedPieceId(null);
    setIsAllCompleted(false);
    setWobbleSlotId(null);
  };

  useEffect(() => {
    initPuzzle(pieceCount);
  }, [targetItem.id, pieceCount]);

  // Handle placing piece onto target slot
  const handlePlacePiece = (pieceId: number, slotId: number) => {
    if (isAllCompleted) return;

    if (pieceId === slotId) {
      // Correct slot!
      hapticsEngine.triggerSuccess(enableHaptics);
      audioEngine.playPop();

      const updatedPieces = pieces.map((p) =>
        p.id === pieceId ? { ...p, placed: true } : p
      );
      setPieces(updatedPieces);
      setUnplacedOrder((prev) => prev.filter((id) => id !== pieceId));
      setSelectedPieceId(null);

      // Check if all placed
      const allDone = updatedPieces.every((p) => p.placed);
      if (allDone) {
        setIsAllCompleted(true);
        audioEngine.playSuccessChime();
        setTimeout(() => {
          onCompleted();
        }, 1200);
      }
    } else {
      // Incorrect slot
      hapticsEngine.triggerWrong(enableHaptics);
      audioEngine.playTryAgainChime();
      setWobbleSlotId(slotId);
      setTimeout(() => setWobbleSlotId(null), 600);
    }
  };

  // Tap piece in tray
  const handlePieceClick = (pieceId: number) => {
    if (isAllCompleted) return;
    hapticsEngine.triggerTap(enableHaptics);
    audioEngine.playPop();
    setSelectedPieceId((prev) => (prev === pieceId ? null : pieceId));
  };

  // Tap slot on board
  const handleSlotClick = (slotId: number) => {
    if (isAllCompleted) return;
    const isAlreadyPlaced = pieces.find((p) => p.id === slotId)?.placed;
    if (isAlreadyPlaced) return;

    if (selectedPieceId !== null) {
      handlePlacePiece(selectedPieceId, slotId);
    } else {
      // Guide the toddler
      audioEngine.playPop();
    }
  };

  const { rows, cols } = getGridConfig(pieceCount);

  return (
    <div className="w-full flex flex-col items-center justify-between gap-5 py-2 select-none">
      {/* 1. TEACHER PIECE COUNT SELECTOR BAR */}
      <div className="flex flex-wrap items-center justify-center gap-2 bg-white/95 px-4 py-2 rounded-2xl border-2 border-amber-200 shadow-xs">
        <span className="text-xs font-black text-amber-950 flex items-center gap-1.5 mr-1">
          <Puzzle className="w-4 h-4 text-amber-600" />
          <span>Số mảnh ghép:</span>
        </span>

        {([2, 3, 4, 6] as PieceCount[]).map((count) => {
          const isCurrent = pieceCount === count;
          return (
            <button
              key={`count_${count}`}
              type="button"
              onClick={() => {
                setPieceCount(count);
                initPuzzle(count);
                audioEngine.playPop();
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer ${
                isCurrent
                  ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {count} mảnh {count === 2 ? '(Bé 12-18th)' : count === 4 ? '(Chuẩn)' : ''}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => initPuzzle(pieceCount)}
          title="Ghép lại tranh này"
          className="ml-2 p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. PUZZLE BOARD (KHUNG TRANH GHÉP CÓ HÌNH MỜ) */}
      <div className="relative p-3 sm:p-4 rounded-4xl bg-amber-100/70 border-4 border-amber-300 shadow-xl">
        <div
          className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden bg-white shadow-inner grid gap-1.5 p-1.5"
          style={{
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {/* Ghost background image for visual guidance */}
          <div className="absolute inset-0 p-4 opacity-25 pointer-events-none flex items-center justify-center">
            <img
              src={targetItem.imageUrl}
              alt={targetItem.name}
              className="w-full h-full object-contain filter grayscale"
            />
          </div>

          {/* Puzzle Slots */}
          {pieces.map((piece) => {
            const isPlaced = piece.placed;
            const isWobbling = wobbleSlotId === piece.id;

            return (
              <div
                key={`slot_${piece.id}`}
                ref={(el) => {
                  boardSlotRefs.current[piece.id] = el;
                }}
                onClick={() => handleSlotClick(piece.id)}
                className={`relative rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-200 ${
                  isPlaced
                    ? 'border-2 border-emerald-400 shadow-sm'
                    : selectedPieceId !== null
                    ? 'border-2 border-dashed border-amber-500 bg-amber-50/60 hover:bg-amber-100/80 animate-pulse'
                    : 'border-2 border-dashed border-slate-300/80 bg-white/40 hover:bg-white/70'
                } ${isWobbling ? 'animate-gentle-wobble border-rose-400 bg-rose-100/70' : ''}`}
              >
                {/* Placed piece slice */}
                {isPlaced ? (
                  <div className="w-full h-full relative overflow-hidden bg-white">
                    <img
                      src={targetItem.imageUrl}
                      alt={targetItem.name}
                      style={{
                        position: 'absolute',
                        width: `${cols * 100}%`,
                        height: `${rows * 100}%`,
                        top: `-${piece.row * 100}%`,
                        left: `-${piece.col * 100}%`,
                        maxWidth: 'none',
                        objectFit: 'contain',
                        padding: '12px',
                      }}
                    />
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-black text-slate-400/80">
                    Mảnh {piece.id + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completed Glow Effect */}
        {isAllCompleted && (
          <div className="absolute inset-0 rounded-4xl border-4 border-emerald-500 ring-8 ring-emerald-300/60 bg-emerald-500/10 flex flex-col items-center justify-center backdrop-blur-2xs animate-in zoom-in-90 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl shadow-xl animate-joyful-bounce mb-2">
              🌟
            </div>
            <span className="text-xl sm:text-2xl font-black text-emerald-950 bg-white/95 px-5 py-2 rounded-2xl shadow-lg border-2 border-emerald-400">
              Ghép Xong Rồi! Bé Giỏi Lắm!
            </span>
          </div>
        )}
      </div>

      {/* 3. UNPLACED PIECES TRAY */}
      {!isAllCompleted && unplacedOrder.length > 0 && (
        <div className="w-full max-w-2xl bg-white/95 p-4 rounded-3xl border-3 border-amber-300 shadow-lg flex flex-col items-center gap-3">
          <div className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Chạm vào mảnh ghép rồi chạm vào đúng ô trên tranh:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {unplacedOrder.map((pieceId) => {
              const piece = pieces.find((p) => p.id === pieceId);
              if (!piece) return null;
              const isSelected = selectedPieceId === pieceId;

              return (
                <button
                  key={`tray_piece_${pieceId}`}
                  type="button"
                  onClick={() => handlePieceClick(pieceId)}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden relative border-3 transition-transform active:scale-95 shadow-md cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 ring-4 ring-amber-300 scale-110 shadow-xl'
                      : 'border-slate-300 hover:border-amber-400 bg-white hover:scale-105'
                  }`}
                >
                  <div className="w-full h-full relative overflow-hidden bg-white">
                    <img
                      src={targetItem.imageUrl}
                      alt={`Mảnh ${pieceId + 1}`}
                      style={{
                        position: 'absolute',
                        width: `${cols * 100}%`,
                        height: `${rows * 100}%`,
                        top: `-${piece.row * 100}%`,
                        left: `-${piece.col * 100}%`,
                        maxWidth: 'none',
                        objectFit: 'contain',
                        padding: '8px',
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
