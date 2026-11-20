"use client";

import { useMemo } from "react";
import { FannedArcTrack } from "@/features/tarot-reading/components/FannedArcTrack";
import { useFannedArcPhysics } from "@/features/tarot-reading/hooks/useFannedArcPhysics";
import type { FanCardItem } from "@/types/tarot";
import { cn } from "@/utils/cn";

interface FannedDeckSpreadProps {
  readonly fanPool: readonly FanCardItem[];
  readonly disabled?: boolean;
  readonly compact?: boolean;
  readonly onPickCard: (fanId: string) => void;
}

export function FannedDeckSpread({
  fanPool = [],
  disabled = false,
  compact = false,
  onPickCard,
}: FannedDeckSpreadProps) {
  const activeCards = useMemo(
    () =>
      Array.isArray(fanPool) ? fanPool.filter((item) => !item.isPicked) : [],
    [fanPool],
  );

  const {
    mobileSlotRefs,
    pcSlotRefs,
    handlePointerDown,
    handleWheel,
    handleCardTap,
  } = useFannedArcPhysics({
    activeCards,
    disabled,
    compact,
    onPickCard,
  });

  if (activeCards.length === 0) return null;

  return (
    <div className="w-full relative mt-auto select-none z-30">
      {/* MOBILE (< 768px) */}
      <div
        className="md:hidden w-full relative touch-none h-[204px] overflow-hidden deck-arc-mask"
        onPointerDown={handlePointerDown}
      >
        <FannedArcTrack
          cards={activeCards}
          slotRefs={mobileSlotRefs}
          pivotTop={435}
          cardSizeClass="w-[98px] h-[156px]"
          cardMotionClass="transition-transform duration-150 ease-out group-active:-translate-y-4 group-active:scale-105"
          disabled={disabled}
          onCardTap={handleCardTap}
        />
        <div className="absolute bottom-0 left-0 right-0 h-5 deck-bottom-fade pointer-events-none z-40" />
      </div>

      {/* PC (>= 768px) */}
      <div
        className={cn(
          "hidden md:block w-full relative touch-none overflow-hidden",
          compact ? "h-[214px]" : "h-[250px] lg:h-[276px]",
        )}
        onPointerDown={handlePointerDown}
        onWheel={handleWheel}
      >
        <FannedArcTrack
          cards={activeCards}
          slotRefs={pcSlotRefs}
          pivotTop={compact ? 945 : 980}
          cardSizeClass={
            compact
              ? "w-[104px] h-[166px]"
              : "w-[120px] h-[190px] lg:w-[132px] lg:h-[210px]"
          }
          cardMotionClass="transition-transform duration-200 ease-out group-hover:-translate-y-7 group-hover:scale-105 group-active:-translate-y-4"
          disabled={disabled}
          onCardTap={handleCardTap}
        />
        <div className="absolute bottom-0 left-0 right-0 h-6 deck-bottom-fade pointer-events-none z-40" />
      </div>
    </div>
  );
}
