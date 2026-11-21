"use client";

import { Layers, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TAROT_CONFIG, TOPIC_PRESETS, UI_TEXTS } from "@/constants/app";
import { FannedDeckSpread } from "@/features/tarot-reading/components/FannedDeckSpread";
import { TarotCardVisual } from "@/features/tarot-reading/components/TarotCardVisual";
import type { DrawnCard, ReadingSession } from "@/types/tarot";
import { cn } from "@/utils/cn";
import { PortalBackdrop } from "./PortalBackdrop";

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
          : "shrink-0 lg:h-full lg:overflow-y-auto mystic-scrollbar",
      )}
    >
      <PortalBackdrop variant="altar" />

      {/* CHẾ ĐỘ MOBILE SAU KHI RÚT BÀI: Tách 2 tầng thoáng đãng thay vì ép 1 hàng ngang */}
      {!isDrawingPhase && (
        <div className="relative z-10 flex flex-col lg:hidden safe-area-top">
          {/* Tầng 1: Câu hỏi trải rộng (chừa góc trái cho nút logo thu gọn) */}
          <div className="text-center pt-3 pb-2">
            <p className="font-serif text-[15px] leading-snug font-medium ink-primary line-clamp-2">
              &ldquo;{session.question}&rdquo;
            </p>
          </div>

          {/* Tầng 2: Sân khấu 3 lá bài chính + lá làm rõ căn giữa toàn màn hình */}
          <div className="flex items-end justify-center gap-3.5 px-4 pt-1.5 pb-2.5 overflow-x-auto">
            {session.initialCards.map((card, idx) => (
              <div
                key={`mini_initial_${idx}`}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <TarotCardVisual
                  drawnCard={card}
                  size="xs"
                  hideTopLabel
                  onClick={() => onInspectCard(card)}
                />
                <span className="text-[10px] font-medium tracking-wider uppercase ink-secondary">
                  {spreadPositions[idx]}
                </span>
              </div>
            ))}

            {clarifierCards.length > 0 && (
              <div
                aria-hidden="true"
                className="h-12 w-px editorial-vertical-divider shrink-0 self-center mx-0.5"
              />
            )}

            {clarifierCards.map((clarifier) => (
              <div
                key={`mini_clarifier_${clarifier.clarifierRound}`}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <TarotCardVisual
                  drawnCard={clarifier}
                  size="xs"
                  hideTopLabel
                  onClick={() => onInspectCard(clarifier)}
                />
                <span className="text-[10px] font-medium tracking-wider uppercase ink-gold">
                  #{clarifier.clarifierRound}
                </span>
              </div>
            ))}
          </div>

          <p className="pb-2.5 text-center text-[11px] ink-secondary opacity-85">
            {UI_TEXTS.SYNTHESIS.TAP_CARD_HINT}
          </p>

          {/* Đường kẻ mờ tan hai đầu thay cho border cứng */}
          <div
            aria-hidden="true"
            className="h-px w-full editorial-guide-divider opacity-65"
          />
        </div>
      )}

      {/* BỐ CỤC CHÍNH (MOBILE LÚC RÚT BÀI + TOÀN BỘ PC) */}
      <div
        className={cn(
          "relative z-10 flex-1 min-h-0 flex-col items-center justify-center px-4 pt-14 pb-2 sm:pt-16 lg:px-8 lg:pt-14",
          isDrawingPhase ? "flex" : "hidden lg:flex",
        )}
      >
        <div className="mb-3 sm:mb-5 max-w-2xl text-center">
          <h1 className="font-serif text-xl sm:text-3xl lg:text-4xl font-medium leading-[1.35] pb-1 ink-primary line-clamp-2">
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
                      "flex items-center justify-center w-[92px] sm:w-[126px] lg:w-[138px] aspect-[2/3.8] rounded-xl transition-all duration-300",
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
            <div className="mt-5 w-full max-w-3xl pt-4">
              <div
                aria-hidden="true"
                className="mb-4 h-px w-full editorial-guide-divider opacity-65"
              />

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
        <div className="relative z-20 surface-header pt-3 motion-veil-panel">
          <div
            aria-hidden="true"
            className="mb-3 h-px w-full editorial-guide-divider"
          />
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
