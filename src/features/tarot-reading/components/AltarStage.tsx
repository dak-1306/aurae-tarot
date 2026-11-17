"use client";

import { Layers, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TAROT_CONFIG, TOPIC_PRESETS, UI_TEXTS } from "@/constants/app";
import { CelestialBackdrop } from "@/features/tarot-reading/components/CelestialBackdrop";
import { FannedDeckSpread } from "@/features/tarot-reading/components/FannedDeckSpread";
import { TarotCardVisual } from "@/features/tarot-reading/components/TarotCardVisual";
import type { DrawnCard, ReadingSession } from "@/types/tarot";
import { cn } from "@/utils/cn";

interface AltarStageProps {
  readonly session: ReadingSession;
  readonly onPickInitialFanCard: (fanId: string) => void;
  readonly onPickClarifierFanCard: (fanId: string) => void;
  readonly onCancelClarifierFan: () => void;
  readonly onInspectCard: (card: DrawnCard) => void;
}

export function AltarStage({
  session,
  onPickInitialFanCard,
  onPickClarifierFanCard,
  onCancelClarifierFan,
  onInspectCard,
}: AltarStageProps) {
  const isDrawingPhase = session.step === "drawing";
  const spreadPositions = TOPIC_PRESETS[session.topicId].spreadPositions;
  const drawnCount = session.initialCards.length;
  const remainingInitialCount = TAROT_CONFIG.INITIAL_DRAW_COUNT - drawnCount;
  const clarifierCards = session.deepDiveRounds.map(
    (round) => round.clarifierCard,
  );
  const isClarifierFanActive = Boolean(session.pendingDeepDiveQuestion);

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden celestial-stage-bg",
        isDrawingPhase
          ? "h-full"
          : "shrink-0 border-b line-accent-subtle lg:border-b-0 lg:h-full lg:overflow-y-auto mystic-scrollbar",
      )}
    >
      <CelestialBackdrop />

      {/* CHẾ ĐỘ THU GỌN TRÊN MOBILE KHI ĐÃ RÚT XONG 3 LÁ (Chừa khoảng trống bên trái cho Logo thu gọn) */}
      {!isDrawingPhase && (
        <div className="relative z-10 flex flex-col gap-2 pl-16 pr-4 py-2.5 lg:hidden safe-area-top">
          <div className="flex items-center justify-between gap-2.5">
            <p className="font-serif text-sm font-medium ink-primary line-clamp-2 flex-1">
              &ldquo;{session.question}&rdquo;
            </p>

            <div className="flex items-center gap-1.5 shrink-0">
              {session.initialCards.map((card, idx) => (
                <TarotCardVisual
                  key={`mini_initial_${idx}`}
                  drawnCard={card}
                  size="xs"
                  hideTopLabel
                  onClick={() => onInspectCard(card)}
                />
              ))}
              {clarifierCards.map((clarifier) => (
                <TarotCardVisual
                  key={`mini_clarifier_${clarifier.clarifierRound}`}
                  drawnCard={clarifier}
                  size="xs"
                  hideTopLabel
                  onClick={() => onInspectCard(clarifier)}
                />
              ))}
            </div>
          </div>

          <p className="text-[11px] ink-secondary">
            {UI_TEXTS.SYNTHESIS.TAP_CARD_HINT}
          </p>
        </div>
      )}

      {/* BỐ CỤC CHÍNH */}
      <div
        className={cn(
          "relative z-10 flex-1 min-h-0 flex-col items-center justify-center px-4 pt-14 pb-2 sm:pt-16 lg:px-8 lg:pt-14",
          isDrawingPhase ? "flex" : "hidden lg:flex",
        )}
      >
        <div className="mb-3 sm:mb-5 max-w-2xl text-center">
          <h1 className="font-serif text-xl sm:text-3xl lg:text-4xl font-medium ink-primary line-clamp-2">
            {session.question}
          </h1>

          {isDrawingPhase && (
            <div className="mt-2 flex flex-col items-center gap-1">
              <StatusBadge
                variant="accent"
                shape="pill"
                icon={<Sparkles className="h-3.5 w-3.5" />}
              >
                {remainingInitialCount > 0
                  ? `${UI_TEXTS.DRAWING.REMAINING_PREFIX} ${drawnCount}${UI_TEXTS.DRAWING.REMAINING_SEPARATOR}`
                  : UI_TEXTS.DRAWING.ALL_DRAWN_HINT}
              </StatusBadge>
              {remainingInitialCount > 0 && (
                <p className="text-xs ink-secondary">
                  {UI_TEXTS.DRAWING.INSTRUCTION_TITLE}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 3 Ô VỊ TRÍ CHÍNH */}
        <div className="flex items-start justify-center gap-3 sm:gap-6 lg:gap-8">
          {spreadPositions.map((positionLabel, slotIndex) => {
            const drawnCard = session.initialCards[slotIndex];
            const isNextTargetSlot = isDrawingPhase && slotIndex === drawnCount;

            return (
              <div
                key={`slot_${slotIndex}_${positionLabel}`}
                className="flex flex-col items-center gap-2"
              >
                {drawnCard ? (
                  <div className="animate-in slide-in-from-bottom-10 zoom-in-75 fade-in duration-300">
                    <TarotCardVisual
                      drawnCard={drawnCard}
                      size="md"
                      hideTopLabel
                      onClick={() => onInspectCard(drawnCard)}
                    />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex items-center justify-center w-[94px] sm:w-[130px] lg:w-[144px] aspect-[2/3.15] rounded-xl transition-all duration-300",
                      isNextTargetSlot
                        ? "empty-slot-surface-next"
                        : "empty-slot-surface",
                    )}
                  >
                    <span className="font-serif text-sm font-bold ink-accent opacity-50">
                      {slotIndex + 1}
                    </span>
                  </div>
                )}

                <span
                  className={cn(
                    "px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-center",
                    drawnCard || isNextTargetSlot
                      ? "slot-label-pill-active"
                      : "slot-label-pill",
                  )}
                >
                  {positionLabel}
                </span>
              </div>
            );
          })}
        </div>

        {/* HÀNG LÁ BỔ TRỢ ĐÀO SÂU */}
        {!isDrawingPhase &&
          (clarifierCards.length > 0 || isClarifierFanActive) && (
            <div className="mt-5 w-full max-w-3xl border-t line-accent-subtle pt-4">
              <div className="mb-2.5 flex items-center justify-center gap-2 text-xs font-medium tracking-wider uppercase ink-accent">
                <Layers className="h-3.5 w-3.5" />
                <span>{UI_TEXTS.COMMON.CLARIFIER_SPREAD_LABEL}</span>
              </div>

              {clarifierCards.length > 0 && (
                <div className="flex flex-wrap items-start justify-center gap-3 sm:gap-5">
                  {clarifierCards.map((clarifier) => (
                    <div
                      key={`clarifier_${clarifier.clarifierRound}_${clarifier.cardId}`}
                      className="animate-in slide-in-from-bottom-8 zoom-in-75 fade-in duration-300"
                    >
                      <TarotCardVisual
                        drawnCard={clarifier}
                        size="sm"
                        onClick={() => onInspectCard(clarifier)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        {!isDrawingPhase && !isClarifierFanActive && (
          <p className="mt-4 text-center text-xs ink-secondary">
            {UI_TEXTS.SYNTHESIS.TAP_CARD_HINT}
          </p>
        )}
      </div>

      {/* DÀN BÀI VÒNG CUNG */}
      {isDrawingPhase && (
        <div className="relative z-20 w-full mt-auto shrink-0">
          <FannedDeckSpread
            fanPool={session.fanPool}
            disabled={remainingInitialCount <= 0}
            onPickCard={onPickInitialFanCard}
          />
        </div>
      )}

      {/* BỘ BÀI PHỤ KHI HỎI ĐÀO SÂU */}
      {!isDrawingPhase && isClarifierFanActive && (
        <div className="relative z-20 border-t line-accent-active surface-header pt-3 motion-veil-panel">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4">
            <div className="min-w-0">
              <p className="font-serif text-sm sm:text-lg font-semibold ink-accent">
                {UI_TEXTS.DRAWING.CLARIFIER_PICK_TITLE}
              </p>
              <p className="text-xs ink-secondary truncate">
                &ldquo;{session.pendingDeepDiveQuestion}&rdquo;
              </p>
            </div>

            <Button
              variant="icon"
              size="icon"
              onClick={onCancelClarifierFan}
              aria-label={UI_TEXTS.DRAWING.BTN_CANCEL_CLARIFIER}
              icon={<X className="h-4 w-4" />}
            />
          </div>

          <FannedDeckSpread
            fanPool={session.clarifierFanPool}
            compact
            onPickCard={onPickClarifierFanCard}
          />
        </div>
      )}
    </div>
  );
}
