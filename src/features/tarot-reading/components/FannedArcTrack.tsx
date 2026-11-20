import { UI_TEXTS } from "@/constants/app";
import { CardBackArt } from "@/features/tarot-reading/components/CardBackArt";
import type { FanCardItem } from "@/types/tarot";
import { cn } from "@/utils/cn";

interface FannedArcTrackProps {
  readonly cards: readonly FanCardItem[];
  readonly slotRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  readonly pivotTop: number;
  readonly cardSizeClass: string;
  readonly cardMotionClass: string;
  readonly disabled: boolean;
  readonly onCardTap: (
    fanId: string,
    cardIdx: number,
    e: React.MouseEvent,
  ) => void;
}

export function FannedArcTrack({
  cards,
  slotRefs,
  pivotTop,
  cardSizeClass,
  cardMotionClass,
  disabled,
  onCardTap,
}: FannedArcTrackProps) {
  return (
    <div className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing">
      <div
        className="absolute left-1/2 flex items-center justify-center"
        style={{ top: `${pivotTop}px`, width: 0, height: 0 }}
      >
        {cards.map((item, idx) => (
          <div
            key={item.fanId}
            ref={(el) => {
              slotRefs.current[idx] = el;
            }}
            onClick={(e) => onCardTap(item.fanId, idx, e)}
            style={{
              transformOrigin: "center center",
              visibility: "hidden",
            }}
            className="group absolute flex items-center justify-center fan-arc-slot"
          >
            <button
              type="button"
              disabled={disabled}
              aria-label={UI_TEXTS.CARD_VISUAL.PICK_THIS_CARD}
              className={cn(
                "relative block shrink-0 rounded-xl cursor-pointer focus:outline-none disabled:pointer-events-none",
                cardSizeClass,
              )}
            >
              <div
                className={cn(
                  "h-full w-full rounded-xl pointer-events-none fan-card-hoverable",
                  cardMotionClass,
                )}
              >
                <CardBackArt />
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
