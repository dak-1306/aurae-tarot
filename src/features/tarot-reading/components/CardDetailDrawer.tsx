"use client";

import { BottomDrawer } from "@/components/ui/BottomDrawer";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SUIT_LABELS, UI_TEXTS } from "@/constants/app";
import { TAROT_CARD_MAP } from "@/constants/tarot-deck";
import { TarotCardVisual } from "@/features/tarot-reading/components/TarotCardVisual";
import type { DrawnCard } from "@/types/tarot";

interface CardDetailDrawerProps {
  readonly card: DrawnCard | null;
  readonly onClose: () => void;
}

export function CardDetailDrawer({ card, onClose }: CardDetailDrawerProps) {
  const definition = card ? TAROT_CARD_MAP[card.cardId] : undefined;

  if (!card || !definition) {
    return null;
  }

  const isReversed = card.orientation === "reversed";
  const keywords = isReversed
    ? definition.keywordsReversed
    : definition.keywordsUpright;
  const meaning = isReversed
    ? definition.meaningReversed
    : definition.meaningUpright;

  return (
    <BottomDrawer
      isOpen={Boolean(card)}
      onClose={onClose}
      title={`${definition.nameVi} — ${definition.nameEn}`}
      subtitle={`${SUIT_LABELS[definition.suit]} • ${
        isReversed
          ? UI_TEXTS.ORIENTATION.REVERSED
          : UI_TEXTS.ORIENTATION.UPRIGHT
      }`}
    >
      <div className="flex flex-col items-center gap-5">
        <TarotCardVisual drawnCard={card} size="lg" />

        <div className="w-full">
          <span className="block text-xs font-semibold uppercase tracking-widest ink-accent mb-2">
            {UI_TEXTS.DRAWER.KEYWORDS_LABEL}
          </span>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <StatusBadge key={kw} variant="accent">
                {kw}
              </StatusBadge>
            ))}
          </div>
        </div>

        <div className="w-full rounded-2xl surface-inset p-4">
          <span className="block text-xs font-semibold uppercase tracking-widest ink-accent mb-1.5">
            {UI_TEXTS.DRAWER.MEANING_LABEL}
          </span>
          <p className="text-sm leading-relaxed ink-primary">{meaning}</p>
        </div>

        <Button variant="outline" fullWidth onClick={onClose}>
          {UI_TEXTS.DRAWER.BTN_CLOSE}
        </Button>
      </div>
    </BottomDrawer>
  );
}
