'use client';

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { UI_TEXTS } from '@/constants/app';
import { CardBackArt } from '@/features/tarot-reading/components/CardBackArt';
import { preloadCardImageById } from '@/features/tarot-reading/utils/imagePreloader';
import type { FanCardItem } from '@/types/tarot';
import { cn } from '@/utils/cn';

interface FannedDeckSpreadProps {
  readonly fanPool: readonly FanCardItem[];
  readonly disabled?: boolean;
  readonly compact?: boolean;
  readonly onPickCard: (fanId: string) => void;
}

interface CircularArcLayerProps {
  readonly cards: readonly FanCardItem[];
  readonly cardPosition: number;
  readonly radius: number;
  readonly pivotTop: number;
  readonly spacingAngle: number;
  readonly visibleRange: number;
  readonly cardSizeClass: string;
  readonly enableHoverLift?: boolean;
  readonly disabled: boolean;
  readonly onCardTap: (fanId: string, e: React.MouseEvent) => void;
}

/**
 * Tầng vòng cung xoay quanh tâm pivot ẩn phía dưới:
 * Giữ nguyên cố định vị trí index của tất cả slot (lá đã rút chỉ ẩn đi)
 * để các lá còn lại không bị dồn chỉ số hay nhảy góc khi rút.
 */
function CircularArcLayer({
  cards,
  cardPosition,
  radius,
  pivotTop,
  spacingAngle,
  visibleRange,
  cardSizeClass,
  enableHoverLift = false,
  disabled,
  onCardTap,
}: CircularArcLayerProps) {
  const total = cards.length;
  if (total === 0) return null;

  const visibleCards = cards
    .map((item, idx) => {
      let diff = idx - cardPosition;
      diff = diff - Math.round(diff / total) * total;
      return { item, diff };
    })
    .filter((entry) => Math.abs(entry.diff) <= visibleRange)
    .sort((a, b) => a.diff - b.diff);

  return (
    <div
      className="absolute left-1/2 flex items-center justify-center"
      style={{
        top: `${pivotTop}px`,
        width: 0,
        height: 0,
      }}
    >
      {visibleCards.map(({ item, diff }, visualIdx) => {
        const relAngle = diff * spacingAngle;
        const cardZIndex = visualIdx + 1;

        return (
          <div
            key={item.fanId}
            onPointerEnter={() => {
              if (!item.isPicked) {
                void preloadCardImageById(item.cardId, 2500);
              }
            }}
            onPointerDown={() => {
              if (!item.isPicked) {
                void preloadCardImageById(item.cardId, 2500);
              }
            }}
            onClick={(e) => {
              if (!item.isPicked) {
                onCardTap(item.fanId, e);
              }
            }}
            style={{
              transform: `rotate(${relAngle}deg) translateY(-${radius}px)`,
              transformOrigin: 'center center',
              zIndex: cardZIndex,
            }}
            className={cn(
              'group absolute flex items-center justify-center transition-opacity duration-200',
              item.isPicked && 'pointer-events-none opacity-0'
            )}
          >
            <button
              type="button"
              disabled={disabled || item.isPicked}
              aria-label={UI_TEXTS.CARD_VISUAL.PICK_THIS_CARD}
              className={cn(
                'relative block shrink-0 rounded-xl cursor-pointer focus:outline-none disabled:pointer-events-none',
                cardSizeClass
              )}
            >
              <div
                className={cn(
                  'h-full w-full rounded-xl transition-transform duration-200 ease-out pointer-events-none fan-card-hoverable',
                  enableHoverLift &&
                    'group-hover:-translate-y-7 group-hover:scale-105',
                  'group-active:-translate-y-5 group-active:scale-105'
                )}
              >
                <CardBackArt />
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function FannedDeckSpread({
  fanPool = [],
  disabled = false,
  compact = false,
  onPickCard,
}: FannedDeckSpreadProps) {
  const safePool = Array.isArray(fanPool) ? fanPool : [];
  const total = safePool.length;
  const hasRemaining = safePool.some((item) => !item.isPicked);

  const [cardPosition, setCardPosition] = useState(0);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startPos = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const dragDistance = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (total === 0 || !hasRemaining) return null;

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startX.current = e.clientX;
    lastX.current = e.clientX;
    startPos.current = cardPosition;
    lastTime.current = Date.now();
    dragDistance.current = 0;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;

    const clientX = e.clientX;
    const deltaX = clientX - startX.current;
    dragDistance.current += Math.abs(clientX - lastX.current);

    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      velocity.current = (clientX - lastX.current) / dt;
    }
    lastX.current = clientX;
    lastTime.current = now;

    const newPos = startPos.current - deltaX / 44;
    setCardPosition(newPos);
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    let v = (-velocity.current / 44) * 16;
    const applyInertia = () => {
      if (Math.abs(v) < 0.005) return;
      v *= 0.91;
      setCardPosition((prev) => prev + v);
      rafRef.current = requestAnimationFrame(applyInertia);
    };
    rafRef.current = requestAnimationFrame(applyInertia);
  };

  const handleWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    const dominantDelta =
      Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (dominantDelta === 0) return;

    setCardPosition((prev) => prev + dominantDelta / 120);
  };

  const handleCardTap = (fanId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (dragDistance.current < 8) {
      onPickCard(fanId);
    }
  };

  const pcSpacingAngle = compact ? 5.2 : 3.6;
  const pcVisibleRange = Math.min(compact ? 9 : 16, (total - 1) / 2);

  return (
    <div className="w-full relative mt-auto select-none z-30">
      {/* MOBILE (< 768px): Vòng cung ~7 lá chạm cực chuẩn, kín 2 bên & đáy */}
      <div
        className="md:hidden w-full relative touch-none h-[200px] overflow-hidden deck-arc-mask"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing">
          <CircularArcLayer
            cards={safePool}
            cardPosition={cardPosition}
            radius={320}
            pivotTop={435}
            spacingAngle={11.5}
            visibleRange={Math.min(4.2, (total - 1) / 2)}
            cardSizeClass="w-[98px] h-[156px]"
            disabled={disabled}
            onCardTap={handleCardTap}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-5 deck-bottom-fade pointer-events-none z-40" />
      </div>

      {/* PC (>= 768px): Trải trọn bộ bài trên 1 vòng cung duy nhất */}
      <div
        className={cn(
          'hidden md:block w-full relative touch-none overflow-hidden',
          compact ? 'h-[210px]' : 'h-[245px] lg:h-[270px]'
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        <div className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing">
          <CircularArcLayer
            cards={safePool}
            cardPosition={cardPosition}
            radius={820}
            pivotTop={compact ? 945 : 980}
            spacingAngle={pcSpacingAngle}
            visibleRange={pcVisibleRange}
            cardSizeClass={
              compact
                ? 'w-[104px] h-[166px]'
                : 'w-[120px] h-[190px] lg:w-[132px] lg:h-[210px]'
            }
            enableHoverLift
            disabled={disabled}
            onCardTap={handleCardTap}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-6 deck-bottom-fade pointer-events-none z-40" />
      </div>
    </div>
  );
}