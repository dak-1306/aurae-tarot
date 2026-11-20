import { TAROT_CONFIG, TOPIC_PRESETS, UI_TEXTS } from "@/constants/app";
import { TAROT_CARD_MAP } from "@/constants/tarot-deck";
import { EditorialMarkdown } from "@/features/tarot-reading/components/EditorialMarkdown";
import {
  ExportCardArtwork,
  extractStoryClosingInsight,
} from "@/features/tarot-reading/components/share/ExportCardArtwork";
import type { ReadingSession } from "@/types/tarot";
import { cn } from "@/utils/cn";
import { formatSessionTimestamp } from "@/utils/dateFormat";

interface ShareStoryCanvasProps {
  readonly templateRef?: React.RefObject<HTMLDivElement | null>;
  readonly session: ReadingSession;
  readonly cardDataUrls?: Readonly<Record<string, string>>;
}

export function ShareStoryCanvas({
  templateRef,
  session,
  cardDataUrls,
}: ShareStoryCanvasProps) {
  const topicLabel = TOPIC_PRESETS[session.topicId].label;
  const hasClarifiers = session.deepDiveRounds.length > 0;

  return (
    <div
      ref={templateRef}
      style={{
        width: `${TAROT_CONFIG.SHARE_IMAGE_WIDTH}px`,
        height: `${TAROT_CONFIG.SHARE_IMAGE_HEIGHT}px`,
      }}
      className={cn(
        "story-canvas-bg flex flex-col justify-between px-14 ink-primary overflow-hidden",
        hasClarifiers ? "py-11" : "py-14",
      )}
    >
      {/* Header thương hiệu & thời gian */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="h-px w-12 editorial-guide-divider" />
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 ink-gold"
            fill="currentColor"
          >
            <path d="M12 1L14.2 9.8L23 12L14.2 14.2L12 23L9.8 14.2L1 12L9.8 9.8L12 1Z" />
          </svg>
          <span className="h-px w-12 editorial-guide-divider" />
        </div>

        <p className="font-serif text-3xl font-bold tracking-[0.35em] ink-accent">
          {UI_TEXTS.HEADER.BRAND_NAME}
        </p>
        <p className="mt-2 text-base tracking-[0.22em] uppercase ink-secondary">
          {topicLabel} • {formatSessionTimestamp(session.createdAt)}
        </p>
      </div>

      {/* Câu hỏi của bạn */}
      <div className="text-center px-6">
        <p className="text-sm uppercase tracking-[0.26em] ink-accent mb-2.5">
          {UI_TEXTS.COMMON.QUESTION_LABEL}
        </p>
        <p className="font-serif text-[34px] italic leading-snug ink-primary line-clamp-2">
          &ldquo;{session.question}&rdquo;
        </p>
      </div>

      {/* 3 Lá bài chủ đạo */}
      <div>
        <div className="grid grid-cols-3 gap-6">
          {session.initialCards.map((card, idx) => {
            const def = TAROT_CARD_MAP[card.cardId];
            if (!def) return null;
            const isReversed = card.orientation === "reversed";

            return (
              <div
                key={`story_card_${idx}`}
                className={cn(
                  "flex flex-col items-center justify-between rounded-3xl story-card-box text-center",
                  hasClarifiers ? "p-4" : "p-5",
                )}
              >
                <span className="rounded-full slot-label-pill-active px-4 py-1 text-sm font-medium">
                  {card.positionLabel}
                </span>

                <ExportCardArtwork
                  card={card}
                  cardDataUrls={cardDataUrls}
                  frameClassName={
                    hasClarifiers
                      ? "w-[158px] h-[260px] my-3"
                      : "w-[178px] h-[294px] my-4"
                  }
                />

                <div className="w-full">
                  <p className="font-serif text-[22px] font-bold ink-primary truncate">
                    {def.nameVi}
                  </p>
                  <p className="mt-0.5 text-sm ink-secondary truncate">
                    {def.nameEn}
                  </p>
                  <p
                    className={cn(
                      "mt-1.5 text-xs font-semibold uppercase tracking-widest",
                      isReversed ? "ink-gold" : "ink-accent",
                    )}
                  >
                    {isReversed
                      ? UI_TEXTS.ORIENTATION.REVERSED
                      : UI_TEXTS.ORIENTATION.UPRIGHT}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tóm lược các lá bài làm rõ (nếu có) */}
      {hasClarifiers && (
        <div className="rounded-3xl surface-card px-8 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] ink-accent mb-2.5">
            {UI_TEXTS.CLOSURE.TEMPLATE_CLARIFIER_TITLE}
          </p>
          <div className="space-y-2.5">
            {session.deepDiveRounds.map((round) => {
              const def = TAROT_CARD_MAP[round.clarifierCard.cardId];
              const isReversed = round.clarifierCard.orientation === "reversed";

              return (
                <div
                  key={`story_round_${round.round}`}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <ExportCardArtwork
                      card={round.clarifierCard}
                      cardDataUrls={cardDataUrls}
                      frameClassName="w-[40px] h-[66px]"
                      compactFallback
                    />
                    <p className="text-base ink-primary line-clamp-1">
                      <span className="font-semibold ink-gold">
                        #{round.round}.
                      </span>{" "}
                      {round.question}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-serif text-base font-semibold ink-accent">
                      {def?.nameVi}
                    </p>
                    <p className="text-[11px] uppercase tracking-wider ink-secondary">
                      {isReversed
                        ? UI_TEXTS.ORIENTATION.REVERSED
                        : UI_TEXTS.ORIENTATION.UPRIGHT}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Khung vòm lời nhắn đọng lại */}
      <div
        className={cn(
          "sanctuary-portal-frame px-10 text-center",
          hasClarifiers ? "pt-6 pb-5" : "pt-8 pb-7",
        )}
      >
        <p className="text-sm font-semibold uppercase tracking-[0.26em] ink-accent mb-3">
          {UI_TEXTS.CLOSURE.TEMPLATE_SYNTHESIS_TITLE}
        </p>
        <div
          className={cn(
            "text-left overflow-hidden",
            hasClarifiers ? "line-clamp-4" : "line-clamp-6",
          )}
        >
          <EditorialMarkdown
            content={extractStoryClosingInsight(session.synthesisText)}
            variant="export"
          />
        </div>
      </div>

      {/* Footer Watermark */}
      <div className="text-center">
        <div className="mx-auto mb-3 h-px w-48 editorial-guide-divider opacity-65" />
        <p className="text-sm tracking-[0.38em] uppercase ink-secondary">
          {UI_TEXTS.CLOSURE.WATERMARK}
        </p>
      </div>
    </div>
  );
}
