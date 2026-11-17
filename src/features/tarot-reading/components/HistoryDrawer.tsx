"use client";

import { Trash2, ArrowUpRight } from "lucide-react";
import { BottomDrawer } from "@/components/ui/BottomDrawer";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TOPIC_PRESETS, UI_TEXTS } from "@/constants/app";
import { TAROT_CARD_MAP } from "@/constants/tarot-deck";
import type { ReadingSession } from "@/types/tarot";
import { formatSessionTimestamp } from "@/utils/dateFormat";

interface HistoryDrawerProps {
  readonly isOpen: boolean;
  readonly history: readonly ReadingSession[];
  readonly onClose: () => void;
  readonly onSelectSession: (session: ReadingSession) => void;
  readonly onDeleteSession: (sessionId: string) => void;
}

export function HistoryDrawer({
  isOpen,
  history,
  onClose,
  onSelectSession,
  onDeleteSession,
}: HistoryDrawerProps) {
  return (
    <BottomDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={UI_TEXTS.HISTORY.DRAWER_TITLE}
      maxWidthClass="md:max-w-2xl"
    >
      {history.length === 0 ? (
        <p className="py-10 text-center text-sm ink-secondary">
          {UI_TEXTS.HISTORY.EMPTY_STATE}
        </p>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const topicLabel = TOPIC_PRESETS[item.topicId]?.label ?? "";
            const cardNames = item.initialCards
              .map((c) => TAROT_CARD_MAP[c.cardId]?.nameVi ?? c.cardId)
              .join(" • ");

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl surface-inset p-4"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] ink-accent">
                    <span>{topicLabel}</span>
                    <span>•</span>
                    <span className="ink-secondary">
                      {formatSessionTimestamp(item.createdAt)}
                    </span>
                    {item.deepDiveRounds.length > 0 && (
                      <StatusBadge variant="gold">
                        +{item.deepDiveRounds.length}{" "}
                        {UI_TEXTS.HISTORY.CLARIFIER_COUNT_SUFFIX}
                      </StatusBadge>
                    )}
                  </div>

                  <p className="font-serif text-base font-medium ink-primary line-clamp-2">
                    &ldquo;{item.question}&rdquo;
                  </p>

                  <p className="text-xs ink-secondary truncate">{cardNames}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="subtle"
                    size="md"
                    onClick={() => onSelectSession(item)}
                    icon={<ArrowUpRight className="h-3.5 w-3.5" />}
                  >
                    {UI_TEXTS.HISTORY.BTN_OPEN}
                  </Button>

                  <Button
                    variant="danger-icon"
                    size="icon"
                    onClick={() => onDeleteSession(item.id)}
                    aria-label={UI_TEXTS.HISTORY.BTN_DELETE}
                    icon={<Trash2 className="h-4 w-4" />}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </BottomDrawer>
  );
}
