import { Compass, Coins, Droplets, Flame, Wind } from "lucide-react";
import { TAROT_CARD_MAP } from "@/constants/tarot-deck";
import { toRomanNumeral } from "@/features/tarot-reading/utils/deckUtils";
import type { DrawnCard, SuitType } from "@/types/tarot";
import { cn } from "@/utils/cn";

function ExportSuitEmblem({
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

interface ExportCardArtworkProps {
  readonly card: DrawnCard;
  readonly cardDataUrls?: Readonly<Record<string, string>>;
  readonly frameClassName: string;
  readonly compactFallback?: boolean;
}

export function ExportCardArtwork({
  card,
  cardDataUrls,
  frameClassName,
  compactFallback = false,
}: ExportCardArtworkProps) {
  const def = TAROT_CARD_MAP[card.cardId];
  if (!def) return null;

  const isReversed = card.orientation === "reversed";
  const resolvedSrc = cardDataUrls?.[card.cardId];
  const numeral =
    def.arcana === "major" ? toRomanNumeral(def.number) : String(def.number);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl card-art-frame flex items-center justify-center shrink-0",
        frameClassName,
      )}
    >
      {resolvedSrc ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={resolvedSrc}
          alt={def.nameVi}
          className={cn(
            "h-full w-full object-contain",
            isReversed && "rotate-180",
          )}
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full flex-col items-center justify-between card-art-backdrop",
            compactFallback ? "p-1.5" : "p-4",
            isReversed && "rotate-180",
          )}
        >
          <span
            className={cn(
              "font-serif font-semibold tracking-widest ink-accent",
              compactFallback ? "text-xs" : "text-xl",
            )}
          >
            {numeral}
          </span>
          <div
            className={cn(
              "flex items-center justify-center rounded-full card-art-medallion",
              compactFallback ? "h-8 w-8" : "h-20 w-20",
            )}
          >
            <ExportSuitEmblem
              suit={def.suit}
              className={cn(
                "ink-accent",
                compactFallback ? "h-4 w-4" : "h-9 w-9",
              )}
            />
          </div>
          {!compactFallback && (
            <span className="font-serif text-xs uppercase tracking-widest ink-secondary text-center line-clamp-1">
              {def.nameEn}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Rút trích đoạn lời nhắn đọng lại sau cùng (bỏ dòng tiêu đề ###) cho thẻ Story 9:16
 */
export function extractStoryClosingInsight(synthesisText: string): string {
  const blocks = synthesisText
    .split("\n\n")
    .map((block) =>
      block
        .split("\n")
        .filter((line) => !/^#{1,3}\s+/.test(line.trim()))
        .join("\n")
        .trim(),
    )
    .filter((block) => block.length > 0);

  return blocks[blocks.length - 1] ?? synthesisText;
}
