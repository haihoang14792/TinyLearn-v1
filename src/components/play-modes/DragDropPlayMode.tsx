import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, CheckCircle2, Hand } from 'lucide-react';
import { TopicItem } from '../../types.ts';
import { audioEngine } from '../../utils/audio.ts';
import { hapticsEngine } from '../../utils/haptics.ts';

interface DragDropPlayModeProps {
  targetItem: TopicItem;
  displayChoices: TopicItem[];
  onCorrectDrop: (item: TopicItem) => void;
  onWrongDrop: (item: TopicItem) => void;
  showHint: boolean;
  enableHaptics?: boolean;
}

export const DragDropPlayMode: React.FC<DragDropPlayModeProps> = ({
  targetItem,
  displayChoices,
  onCorrectDrop,
  onWrongDrop,
  showHint,
  enableHaptics = true,
}) => {
  // Currently dragging state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [activeDropZoneId, setActiveDropZoneId] = useState<string | null>(null);
  const [isSuccessSnapped, setIsSuccessSnapped] = useState(false);
  const [wobbleTargetId, setWobbleTargetId] = useState<string | null>(null);

  const dropZoneRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragItemRef = useRef<HTMLDivElement | null>(null);

  // Reset when target item changes
  useEffect(() => {
    setSelectedItemId(null);
    setDragOffset(null);
    setDragPos(null);
    setActiveDropZoneId(null);
    setIsSuccessSnapped(false);
    setWobbleTargetId(null);
  }, [targetItem.id]);

  // Handle pointer down (mouse, touch, pen)
  const handlePointerDown = (item: TopicItem, e: React.PointerEvent<HTMLDivElement>) => {
    if (isSuccessSnapped) return;
    e.preventDefault();
    hapticsEngine.triggerTap(enableHaptics);
    audioEngine.playPop();

    setSelectedItemId(item.id);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDragPos({
      x: e.clientX,
      y: e.clientY,
    });

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored if capture unsupported
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!selectedItemId || !dragOffset) return;
    setDragPos({
      x: e.clientX,
      y: e.clientY,
    });

    // Check hit test over drop zones
    let hoveredZoneId: string | null = null;
    for (const [id, el] of Object.entries(dropZoneRefs.current)) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (
        e.clientX >= rect.left - 20 &&
        e.clientX <= rect.right + 20 &&
        e.clientY >= rect.top - 20 &&
        e.clientY <= rect.bottom + 20
      ) {
        hoveredZoneId = id;
        break;
      }
    }
    setActiveDropZoneId(hoveredZoneId);
  };

  const handlePointerUp = (item: TopicItem, e: React.PointerEvent<HTMLDivElement>) => {
    if (!selectedItemId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    if (activeDropZoneId) {
      handleCheckDrop(item, activeDropZoneId);
    } else {
      // Released outside, cancel drag
      setDragOffset(null);
      setDragPos(null);
      setActiveDropZoneId(null);
    }
  };

  // Evaluate drop on a specific zone
  const handleCheckDrop = (droppedItem: TopicItem, dropZoneId: string) => {
    // Correct if the dropzone corresponds to the target item
    if (dropZoneId === targetItem.id && droppedItem.id === targetItem.id) {
      setIsSuccessSnapped(true);
      hapticsEngine.triggerSuccess(enableHaptics);
      audioEngine.playSuccessChime();
      onCorrectDrop(droppedItem);
    } else {
      // Wrong zone
      hapticsEngine.triggerWrong(enableHaptics);
      audioEngine.playTryAgainChime();
      setWobbleTargetId(dropZoneId);
      setTimeout(() => setWobbleTargetId(null), 700);

      // Return draggable
      setDragOffset(null);
      setDragPos(null);
      setActiveDropZoneId(null);
      onWrongDrop(droppedItem);
    }
  };

  // Tap-to-select then tap-target (Toddler alternative to drag)
  const handleZoneClick = (zoneId: string) => {
    if (!selectedItemId || isSuccessSnapped) {
      // Just tapping a zone without item selected: guide toddler
      audioEngine.playPop();
      return;
    }
    const item = displayChoices.find((c) => c.id === selectedItemId);
    if (item) {
      handleCheckDrop(item, zoneId);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-between gap-6 py-2 select-none">
      {/* 1. DROP ZONES (HÌNH BÓNG & GIỎ ĐÍCH) */}
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xs sm:text-sm font-extrabold text-amber-900 bg-amber-100/90 border border-amber-300 px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
            <Hand className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>Kéo hình hoặc chạm hình rồi chạm vào bóng tương ứng:</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 justify-center">
          {displayChoices.map((choice) => {
            const isTarget = choice.id === targetItem.id;
            const isHovered = activeDropZoneId === choice.id;
            const isWobbling = wobbleTargetId === choice.id;
            const isFilled = isSuccessSnapped && isTarget;

            return (
              <div
                key={`dropzone_${choice.id}`}
                ref={(el) => {
                  dropZoneRefs.current[choice.id] = el;
                }}
                onClick={() => handleZoneClick(choice.id)}
                className={`relative flex flex-col items-center justify-center p-4 sm:p-6 rounded-4xl border-4 transition-all duration-200 cursor-pointer min-h-[170px] sm:min-h-[220px] ${
                  isFilled
                    ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-200 scale-105 shadow-xl'
                    : isHovered
                    ? 'bg-amber-100/90 border-amber-500 scale-105 ring-4 ring-amber-300 shadow-lg'
                    : showHint && isTarget
                    ? 'bg-amber-50/80 border-dashed border-amber-400 ring-4 ring-amber-300/80 shadow-md animate-pulse'
                    : 'bg-slate-100/80 hover:bg-slate-100 border-dashed border-slate-300 shadow-inner'
                } ${isWobbling ? 'animate-gentle-wobble border-rose-400 bg-rose-50' : ''}`}
              >
                {/* Silhouette / Shadow or Snapped image */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center relative">
                  {isFilled ? (
                    <div className="w-full h-full flex items-center justify-center animate-in zoom-in-50 duration-300">
                      <img
                        src={choice.imageUrl}
                        alt={choice.name}
                        className="w-full h-full object-contain filter drop-shadow-md"
                      />
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-30 filter grayscale brightness-50">
                      <img
                        src={choice.imageUrl}
                        alt={`Bóng ${choice.name}`}
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-3 text-center">
                  <span
                    className={`text-xs sm:text-sm font-black px-3 py-1 rounded-full ${
                      isFilled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/80 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {isFilled ? choice.name : `Bóng của ${choice.name}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. DRAGGABLE CARDS TRAY */}
      {!isSuccessSnapped && (
        <div className="w-full max-w-2xl bg-white/95 p-4 sm:p-5 rounded-4xl border-3 border-amber-300 shadow-xl flex flex-col items-center gap-3">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Chạm & kéo vật phẩm này lên bóng của nó nào:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {displayChoices.map((item) => {
              const isSelected = selectedItemId === item.id;
              const isTarget = item.id === targetItem.id;

              return (
                <div
                  key={`drag_${item.id}`}
                  ref={isSelected ? dragItemRef : null}
                  onPointerDown={(e) => handlePointerDown(item, e)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={(e) => handlePointerUp(item, e)}
                  onPointerCancel={(e) => handlePointerUp(item, e)}
                  style={{ touchAction: 'none' }}
                  className={`w-28 h-28 sm:w-36 sm:h-36 p-3 rounded-3xl border-4 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing transition-transform active:scale-105 shadow-md ${
                    isSelected
                      ? 'bg-amber-100 border-amber-500 ring-4 ring-amber-300 scale-110 shadow-2xl z-30'
                      : showHint && isTarget
                      ? 'bg-white border-amber-400 ring-4 ring-amber-200 animate-pulse'
                      : 'bg-white border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <div className="w-16 h-16 sm:w-22 sm:h-22 flex items-center justify-center pointer-events-none">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-contain filter drop-shadow-xs"
                    />
                  </div>
                  <span className="mt-1 text-xs font-black text-slate-800 pointer-events-none line-clamp-1">
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
