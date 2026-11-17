"use client";

import { useState } from "react";
import { Compass, Flame, Droplets, Wind, Coins } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UI_TEXTS } from "@/constants/app";
import { TAROT_CARD_MAP } from "@/constants/tarot-deck";
import { CardBackArt } from "@/features/tarot-reading/components/CardBackArt";
import { toRomanNumeral } from "@/features/tarot-reading/utils/deckUtils";
import type { DrawnCard, SuitType } from "@/types/tarot";
import { cn } from "@/utils/cn";

interface TarotCardVisualProps {
  readonly drawnCard: DrawnCard;
  readonly size?: "xs" | "sm" | "md" | "lg";
  readonly hideTopLabel?: boolean;
  readonly onClick?: () => void;
}

function SuitEmblem({
  suit,
  className,
}: {
  readonly suit: SuitType;
  readonly className?: string;
}) {
  switch (suit) {
    case "wands":
      return <Flame className={className} />;
    case "cups":
      return <Droplets className={className} />;
    case "swords":
      return <Wind className={className} />;
    case "pentacles":
      return <Coins className={className} />;
    default:
      return <Compass className={className} />;
  }
}

const SIZE_STYLES = {
  xs: "w-[68px] aspect-[2/3.1]",
  sm: "w-[86px] sm:w-[106px] aspect-[2/3.15]",
  md: "w-[94px] sm:w-[130px] lg:w-[144px] aspect-[2/3.15]",
  lg: "w-[172px] sm:w-[196px] aspect-[2/3.15]",
} as const;

export function TarotCardVisual({
  drawnCard,
  size = "md",
  hideTopLabel = false,
  onClick,
}: TarotCardVisualProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const definition = TAROT_CARD_MAP[drawnCard.cardId];
  const isReversed = drawnCard.orientation === "reversed";

  if (!definition) {
    return null;
  }

  const numeralLabel =
    definition.arcana === "major"
      ? toRomanNumeral(definition.number)
      : String(definition.number);

  const isMiniCard = size === "xs";

  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      {!hideTopLabel && (
        <StatusBadge variant={drawnCard.isClarifier ? "gold" : "accent"}>
          <span className="max-w-[96px] sm:max-w-[144px] truncate">
            {drawnCard.isClarifier && drawnCard.clarifierRound
              ? `${UI_TEXTS.DEEP_DIVE.CLARIFIER_BADGE_PREFIX}${drawnCard.clarifierRound}`
              : drawnCard.positionLabel}
          </span>
        </StatusBadge>
      )}

      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group relative rounded-2xl perspective-1000 focus:outline-none cursor-pointer tarot-card-interactive",
          SIZE_STYLES[size],
        )}
      >
        <div
          className={cn(
            "relative h-full w-full transition-transform duration-500 ease-out preserve-3d",
            drawnCard.isRevealed && "rotate-y-180",
          )}
        >
          {/* MẶT ÚP (0 deg) */}
          <div className="absolute inset-0 backface-hidden">
            <CardBackArt />
          </div>

          {/* MẶT NGỬA (180 deg) */}
          <div
            className={cn(
              "absolute inset-0 backface-hidden rotate-y-180 flex flex-col justify-between overflow-hidden rounded-2xl card-face-surface",
              isMiniCard ? "p-1" : "p-1.5 sm:p-2",
            )}
          >
            <div
              className={cn(
                "relative flex-1 w-full overflow-hidden rounded-xl card-art-frame transition-transform duration-500",
                isReversed && "rotate-180",
              )}
            >
              {!imageFailed ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={definition.imageUrl}
                  alt={definition.nameVi}
                  onError={() => setImageFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-between card-art-backdrop p-1.5 sm:p-2">
                  <span className="font-serif text-[10px] sm:text-sm font-semibold tracking-widest ink-accent">
                    {numeralLabel}
                  </span>

                  <div
                    className={cn(
                      "relative flex items-center justify-center rounded-full card-art-medallion",
                      isMiniCard ? "h-8 w-8" : "h-11 w-11 sm:h-14 sm:w-14",
                    )}
                  >
                    <div className="absolute inset-1 rounded-full card-art-medallion-ring" />
                    <SuitEmblem
                      suit={definition.suit}
                      className={cn(
                        "ink-accent",
                        isMiniCard ? "h-3.5 w-3.5" : "h-5 w-5 sm:h-6 sm:w-6",
                      )}
                    />
                  </div>

                  {!isMiniCard && (
                    <span className="font-serif text-[9px] sm:text-[11px] uppercase tracking-widest ink-secondary text-center line-clamp-1">
                      {definition.nameEn}
                    </span>
                  )}
                </div>
              )}
            </div>

            {!isMiniCard && (
              <div className="pt-1.5 text-center">
                <p className="font-serif text-xs sm:text-sm font-semibold leading-tight ink-primary line-clamp-1">
                  {definition.nameVi}
                </p>
                <span
                  className={cn(
                    "mt-0.5 inline-block text-[9px] sm:text-[10px] font-medium tracking-wider uppercase",
                    isReversed ? "ink-gold" : "ink-accent",
                  )}
                >
                  {isReversed
                    ? UI_TEXTS.ORIENTATION.REVERSED
                    : UI_TEXTS.ORIENTATION.UPRIGHT}
                </span>
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
