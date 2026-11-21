"use client";

import { useState } from "react";
import { ImageDown, Send } from "lucide-react";
import { AuraeLoader } from "@/components/ui/AuraeLoader";
import { Button } from "@/components/ui/Button";
import { ChipButton } from "@/components/ui/ChipButton";
import { Collapsible } from "@/components/ui/Collapsible";
import { TextInput } from "@/components/ui/FormField";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TAROT_CONFIG, TOPIC_PRESETS, UI_TEXTS } from "@/constants/app";
import { TAROT_CARD_MAP } from "@/constants/tarot-deck";
import { EditorialMarkdown } from "@/features/tarot-reading/components/EditorialMarkdown";
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
  const deepDiveSuggestions =
    session.suggestedDeepDiveQuestions &&
    session.suggestedDeepDiveQuestions.length > 0
      ? session.suggestedDeepDiveQuestions
      : preset.deepDiveSuggestions;

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
    <aside className="relative flex flex-1 min-h-0 flex-col surface-reading-aside lg:h-full">
      {/* Vệt phân tách dọc mờ tan hai đầu trên PC thay cho border-l cứng */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute left-0 top-10 bottom-10 w-px editorial-vertical-divider"
      />

      {/* Vùng cuộn nội bộ duy nhất của bảng luận giải */}
      <div className="flex-1 min-h-0 overflow-y-auto mystic-scrollbar space-y-6 px-4 pt-5 pb-6 sm:px-6 sm:pt-6">
        {/* KHUNG CỔNG CHIÊM NGHIỆM: Lời nhắn tổng quan 3 lá */}
        <div className="sanctuary-portal-frame px-5 pt-6 pb-5 sm:px-7 sm:pt-7 sm:pb-6">
          {/* Đỉnh vòm trang trí ngôi sao 4 cánh */}
          <div className="flex flex-col items-center text-center mb-4">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 ink-gold mb-2 opacity-85"
              fill="currentColor"
            >
              <path d="M12 1L14.2 9.8L23 12L14.2 14.2L12 23L9.8 14.2L1 12L9.8 9.8L12 1Z" />
            </svg>

            <div className="flex items-center justify-center gap-2.5">
              <h2 className="font-serif text-lg sm:text-xl font-semibold ink-accent">
                {UI_TEXTS.SYNTHESIS.PANEL_TITLE}
              </h2>

              {isStreamingSynthesis && (
                <StatusBadge variant="accent" shape="pill">
                  {UI_TEXTS.SYNTHESIS.STREAMING_BADGE}
                </StatusBadge>
              )}
            </div>

            <div
              aria-hidden="true"
              className="mt-3.5 h-px w-3/4 editorial-guide-divider opacity-75"
            />
          </div>

          {isStreamingSynthesis && !session.synthesisText ? (
            <AuraeLoader
              variant="block"
              label="Đang kết nối mạch lời nhắn của ba lá bài..."
            />
          ) : session.synthesisText ? (
            <EditorialMarkdown
              content={session.synthesisText}
              isStreaming={isStreamingSynthesis}
            />
          ) : (
            <p className="text-center text-xs italic ink-secondary">
              Chưa nhận được nội dung. Bạn thử lại một chút nhé.
            </p>
          )}
        </div>

        {/* Các vòng Hỏi Thêm: Trình bày dạng nhật ký mở nối tiếp, không đóng hộp thô */}
        {session.deepDiveRounds.map((round) => {
          const clarifierDef = TAROT_CARD_MAP[round.clarifierCard.cardId];
          const isRoundStreaming = streamingDeepDiveRound === round.round;

          return (
            <div
              key={`round_${round.round}`}
              className="px-1.5 sm:px-2 space-y-3 motion-veil-panel"
            >
              <div
                aria-hidden="true"
                className="h-px w-full editorial-guide-divider opacity-65"
              />

              <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
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
                <AuraeLoader
                  variant="inline"
                  label="Đang soi chiếu lá bài làm rõ..."
                  className="py-2"
                />
              ) : round.aiResponse ? (
                <EditorialMarkdown
                  content={round.aiResponse}
                  isStreaming={isRoundStreaming}
                />
              ) : (
                <p className="text-xs italic ink-secondary">
                  Chưa nhận được phản hồi cho lượt này. Bạn bấm Thử lại nhé.
                </p>
              )}
            </div>
          );
        })}

        {/* Bảng điều khiển câu hỏi Hỏi Thêm mở mượt bằng Collapsible */}
        <Collapsible isOpen={!isStreamingSynthesis} direction="vertical">
          <div className="pt-1 space-y-3.5">
            <div
              aria-hidden="true"
              className="h-px w-full editorial-guide-divider opacity-65"
            />

            <div className="pt-1 flex items-center justify-between gap-2">
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
                  {deepDiveSuggestions.map((suggestion) => (
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
