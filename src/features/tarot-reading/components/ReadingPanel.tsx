"use client";

import { useState } from "react";
import { ImageDown, Send, Sparkles } from "lucide-react";
import { AuraeLoader } from "@/components/ui/AuraeLoader";
import { Button } from "@/components/ui/Button";
import { ChipButton } from "@/components/ui/ChipButton";
import { Collapsible } from "@/components/ui/Collapsible";
import { TextInput } from "@/components/ui/FormField";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TAROT_CONFIG, TOPIC_PRESETS, UI_TEXTS } from "@/constants/app";
import { TAROT_CARD_MAP } from "@/constants/tarot-deck";
import type { DeepDiveRoundNumber, ReadingSession } from "@/types/tarot";

interface ReadingPanelProps {
  readonly session: ReadingSession;
  readonly isStreamingSynthesis: boolean;
  readonly streamingDeepDiveRound: DeepDiveRoundNumber | null;
  readonly errorMessage: string | null;
  readonly onRequestDeepDiveDraw: (question: string) => void;
  readonly onOpenShareModal: () => void;
}

export function ReadingPanel({
  session,
  isStreamingSynthesis,
  streamingDeepDiveRound,
  errorMessage,
  onRequestDeepDiveDraw,
  onOpenShareModal,
}: ReadingPanelProps) {
  const [customFollowUp, setCustomFollowUp] = useState("");

  const preset = TOPIC_PRESETS[session.topicId];
  const remainingRounds =
    TAROT_CONFIG.MAX_DEEP_DIVE_ROUNDS - session.deepDiveRounds.length;
  const isBusyStreaming =
    isStreamingSynthesis || streamingDeepDiveRound !== null;
  const isPickingClarifier = Boolean(session.pendingDeepDiveQuestion);
  const canDeepDive =
    session.step !== "drawing" &&
    !isBusyStreaming &&
    !isPickingClarifier &&
    remainingRounds > 0;

  function handleChipClick(suggestion: string) {
    if (!canDeepDive) return;
    onRequestDeepDiveDraw(suggestion);
  }

  function handleCustomSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canDeepDive) return;
    const trimmed = customFollowUp.trim();
    if (!trimmed) {
      onRequestDeepDiveDraw("");
      return;
    }
    setCustomFollowUp("");
    onRequestDeepDiveDraw(trimmed);
  }

  return (
    <aside className="flex flex-1 min-h-0 flex-col surface-reading-aside lg:h-full lg:border-l">
      {/* Vùng cuộn nội bộ duy nhất của bảng luận giải */}
      <div className="flex-1 min-h-0 overflow-y-auto mystic-scrollbar space-y-5 px-4 py-4 sm:px-6 sm:py-5">
        {/* Luận giải tổng quan 3 lá */}
        <div className="surface-glass rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 border-b line-accent-subtle pb-3 mb-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 ink-accent" />
              <h2 className="font-serif text-lg sm:text-xl font-semibold ink-accent">
                {UI_TEXTS.SYNTHESIS.PANEL_TITLE}
              </h2>
            </div>

            <StatusBadge variant="accent" shape="pill">
              {isStreamingSynthesis
                ? UI_TEXTS.SYNTHESIS.STREAMING_BADGE
                : UI_TEXTS.SYNTHESIS.COMPLETE_BADGE}
            </StatusBadge>
          </div>

          {isStreamingSynthesis && !session.synthesisText ? (
            /* (2) Trạng thái chờ khi Gemini đang xử lý những chữ đầu tiên */
            <AuraeLoader
              variant="block"
              label="Đang kết nối mạch liên kết của ba lá bài..."
            />
          ) : (
            <div className="whitespace-pre-line text-sm sm:text-[15px] leading-relaxed ink-primary">
              {session.synthesisText || (
                <span className="text-xs italic ink-secondary">
                  Chưa nhận được nội dung luận giải. Vui lòng thử lại.
                </span>
              )}
              {/* (4) Con trỏ tinh bàn đồng bộ khi chữ đang stream */}
              {isStreamingSynthesis && (
                <AuraeLoader
                  variant="inline"
                  size="sm"
                  className="ml-1.5 align-middle"
                />
              )}
            </div>
          )}
        </div>

        {/* Các vòng Đào Sâu cộng dồn */}
        {session.deepDiveRounds.map((round) => {
          const clarifierDef = TAROT_CARD_MAP[round.clarifierCard.cardId];
          const isRoundStreaming = streamingDeepDiveRound === round.round;

          return (
            <div
              key={`round_${round.round}`}
              className="rounded-xl surface-card p-4 sm:p-5 space-y-3 motion-veil-panel"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b line-accent-subtle pb-2.5">
                <StatusBadge variant="gold" shape="plaque">
                  {UI_TEXTS.DEEP_DIVE.CLARIFIER_BADGE_PREFIX}
                  {round.round} • {clarifierDef?.nameVi}
                </StatusBadge>
                <span className="text-[11px] ink-secondary">
                  {round.clarifierCard.orientation === "reversed"
                    ? UI_TEXTS.ORIENTATION.REVERSED
                    : UI_TEXTS.ORIENTATION.UPRIGHT}
                </span>
              </div>

              <p className="font-serif text-base italic ink-accent">
                &ldquo;{round.question}&rdquo;
              </p>

              {isRoundStreaming && !round.aiResponse ? (
                /* (3) Trạng thái chờ khi Gemini đang soi chiếu lá bài bổ trợ */
                <AuraeLoader
                  variant="inline"
                  label="Đang soi chiếu lá bài bổ trợ..."
                  className="py-2"
                />
              ) : (
                <div className="whitespace-pre-line text-sm sm:text-[15px] leading-relaxed ink-primary">
                  {round.aiResponse || (
                    <span className="text-xs italic ink-secondary">
                      Chưa nhận được phản hồi cho vòng này. Vui lòng bấm Thử
                      lại.
                    </span>
                  )}
                  {/* (4) Con trỏ tinh bàn đồng bộ khi vòng hỏi sâu đang stream */}
                  {isRoundStreaming && (
                    <AuraeLoader
                      variant="inline"
                      size="sm"
                      className="ml-1.5 align-middle"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Bảng điều khiển câu hỏi Đào Sâu mở mượt bằng Collapsible dùng chung */}
        <Collapsible isOpen={!isStreamingSynthesis} direction="vertical">
          <div className="surface-glass rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-serif text-lg font-semibold ink-primary">
                {UI_TEXTS.DEEP_DIVE.SECTION_TITLE}
              </h3>
              <span className="text-xs font-medium ink-secondary">
                {UI_TEXTS.DEEP_DIVE.REMAINING_ROUNDS_LABEL}{" "}
                <strong className="ink-accent">{remainingRounds}</strong>/
                {TAROT_CONFIG.MAX_DEEP_DIVE_ROUNDS}
              </span>
            </div>

            {remainingRounds > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-2">
                  {preset.deepDiveSuggestions.map((suggestion) => (
                    <ChipButton
                      key={suggestion}
                      variant="card"
                      disabled={!canDeepDive}
                      onClick={() => handleChipClick(suggestion)}
                    >
                      {suggestion}
                    </ChipButton>
                  ))}
                </div>

                <form onSubmit={handleCustomSubmit} className="flex gap-2">
                  <div className="flex-1 min-w-0">
                    <TextInput
                      value={customFollowUp}
                      disabled={!canDeepDive}
                      hasError={Boolean(errorMessage)}
                      onChange={setCustomFollowUp}
                      placeholder={
                        UI_TEXTS.DEEP_DIVE.CUSTOM_QUESTION_PLACEHOLDER
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="icon"
                    size="icon"
                    disabled={!canDeepDive}
                    aria-label={UI_TEXTS.DEEP_DIVE.BTN_DRAW_CLARIFIER}
                    icon={<Send className="h-4 w-4 ink-accent" />}
                  />
                </form>

                {errorMessage && (
                  <p className="text-xs ink-warning">{errorMessage}</p>
                )}
              </>
            ) : (
              <p className="text-xs sm:text-sm ink-secondary">
                {UI_TEXTS.DEEP_DIVE.MAX_ROUNDS_REACHED}
              </p>
            )}
          </div>
        </Collapsible>
      </div>

      {/* Thanh hành động đáy cố định xuất ảnh 9:16 dáng Thẻ bài chỉ kép vàng */}
      {!isBusyStreaming && session.synthesisText.length > 0 && (
        <div className="shrink-0 surface-footer-bar px-4 py-3 sm:px-6 safe-area-bottom">
          <Button
            variant="gold"
            size="lg"
            fullWidth
            onClick={onOpenShareModal}
            icon={<ImageDown className="h-4 w-4" />}
          >
            {UI_TEXTS.CLOSURE.BTN_OPEN_SHARE}
          </Button>
        </div>
      )}
    </aside>
  );
}
