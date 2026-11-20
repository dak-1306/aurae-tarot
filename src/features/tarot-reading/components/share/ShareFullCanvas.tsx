import { TAROT_CONFIG, TOPIC_PRESETS, UI_TEXTS } from "@/constants/app";
import { TAROT_CARD_MAP } from "@/constants/tarot-deck";
import { EditorialMarkdown } from "@/features/tarot-reading/components/EditorialMarkdown";
import { ExportCardArtwork } from "@/features/tarot-reading/components/share/ExportCardArtwork";
import type { ReadingSession } from "@/types/tarot";
import { cn } from "@/utils/cn";
import { formatSessionTimestamp } from "@/utils/dateFormat";

interface ShareFullCanvasProps {
  readonly templateRef?: React.RefObject<HTMLDivElement | null>;
  readonly session: ReadingSession;
  readonly cardDataUrls?: Readonly<Record<string, string>>;
}

export function ShareFullCanvas({
  templateRef,
  session,
  cardDataUrls,
}: ShareFullCanvasProps) {
  const topicLabel = TOPIC_PRESETS[session.topicId].label;

  return (
    <div
      ref={templateRef}
      style={{
        width: `${TAROT_CONFIG.SHARE_IMAGE_WIDTH}px`,
      }}
      className="story-canvas-bg flex flex-col gap-9 p-14 ink-primary"
    >
      {/* 1. Phần đầu thương hiệu */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2.5">
          <span className="h-px w-16 editorial-guide-divider" />
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 ink-gold"
            fill="currentColor"
          >
            <path d="M12 1L14.2 9.8L23 12L14.2 14.2L12 23L9.8 14.2L1 12L9.8 9.8L12 1Z" />
          </svg>
          <span className="h-px w-16 editorial-guide-divider" />
        </div>

        <p className="font-serif text-4xl font-bold tracking-[0.35em] ink-accent">
          {UI_TEXTS.HEADER.BRAND_NAME}
        </p>
        <p className="mt-2.5 text-lg tracking-[0.22em] uppercase ink-secondary">
          {topicLabel} • {formatSessionTimestamp(session.createdAt)}
        </p>
      </div>

      {/* 2. Câu hỏi chính */}
      <div className="px-8 py-4 text-center">
        <p className="text-sm uppercase tracking-[0.28em] ink-accent mb-3">
          {UI_TEXTS.COMMON.QUESTION_LABEL}
        </p>
        <p className="font-serif text-[36px] italic leading-relaxed ink-primary">
          &ldquo;{session.question}&rdquo;
        </p>
      </div>

      {/* 3. Bộ 3 lá bài chủ đạo */}
      <div>
        <div className="grid grid-cols-3 gap-6">
          {session.initialCards.map((card, idx) => {
            const def = TAROT_CARD_MAP[card.cardId];
            if (!def) return null;
            const isReversed = card.orientation === "reversed";

            return (
              <div
                key={`full_core_${idx}`}
                className="flex flex-col items-center justify-between rounded-3xl story-card-box p-6 text-center"
              >
                <span className="rounded-full slot-label-pill-active px-4 py-1 text-base font-medium">
                  {card.positionLabel}
                </span>

                <ExportCardArtwork
                  card={card}
                  cardDataUrls={cardDataUrls}
                  frameClassName="w-[196px] h-[324px] my-4"
                />

                <div className="w-full">
                  <p className="font-serif text-2xl font-bold ink-primary">
                    {def.nameVi}
                  </p>
                  <p className="mt-1 text-base ink-secondary">{def.nameEn}</p>
                  <p
                    className={cn(
                      "mt-2.5 text-sm font-semibold uppercase tracking-wider",
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

      {/* 4. Khung cổng lời nhắn tổng quan */}
      <div className="sanctuary-portal-frame px-12 pt-10 pb-11">
        <div className="flex flex-col items-center text-center mb-7">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 ink-gold mb-2.5 opacity-85"
            fill="currentColor"
          >
            <path d="M12 1L14.2 9.8L23 12L14.2 14.2L12 23L9.8 14.2L1 12L9.8 9.8L12 1Z" />
          </svg>
          <p className="text-lg font-semibold uppercase tracking-[0.26em] ink-accent">
            {UI_TEXTS.SYNTHESIS.PANEL_TITLE}
          </p>
          <div className="mt-4 h-px w-2/3 editorial-guide-divider opacity-75" />
        </div>

        <EditorialMarkdown content={session.synthesisText} variant="export" />
      </div>

      {/* 5. Hành trình Hỏi thêm (Trình bày dạng nhật ký mở nối tiếp) */}
      {session.deepDiveRounds.length > 0 && (
        <div className="space-y-8 pt-2">
          <div className="text-center">
            <p className="text-base font-semibold uppercase tracking-[0.28em] ink-accent">
              {UI_TEXTS.CLOSURE.TEMPLATE_CLARIFIER_TITLE}
            </p>
          </div>

          {session.deepDiveRounds.map((round) => {
            const clarifierDef = TAROT_CARD_MAP[round.clarifierCard.cardId];
            const isReversed = round.clarifierCard.orientation === "reversed";

            return (
              <div key={`full_round_${round.round}`} className="space-y-6">
                <div className="h-px w-full editorial-guide-divider opacity-70" />

                <div className="flex items-center gap-7 pt-2">
                  <ExportCardArtwork
                    card={round.clarifierCard}
                    cardDataUrls={cardDataUrls}
                    frameClassName="w-[132px] h-[218px]"
                  />

                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full slot-label-pill-active px-4 py-1 text-sm font-semibold">
                        {UI_TEXTS.DEEP_DIVE.CLARIFIER_BADGE_PREFIX}
                        {round.round}
                      </span>
                      <span className="font-serif text-2xl font-bold ink-accent">
                        {clarifierDef?.nameVi}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-semibold uppercase tracking-wider",
                          isReversed ? "ink-gold" : "ink-secondary",
                        )}
                      >
                        (
                        {isReversed
                          ? UI_TEXTS.ORIENTATION.REVERSED
                          : UI_TEXTS.ORIENTATION.UPRIGHT}
                        )
                      </span>
                    </div>

                    <p className="font-serif text-[28px] italic leading-snug ink-primary">
                      &ldquo;{round.question}&rdquo;
                    </p>
                  </div>
                </div>

                <EditorialMarkdown
                  content={round.aiResponse}
                  variant="export"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Phần kết & Watermark */}
      <div className="pt-6 text-center">
        <div className="mx-auto mb-4 h-px w-64 editorial-guide-divider opacity-70" />
        <p className="text-base tracking-[0.38em] uppercase ink-secondary">
          {UI_TEXTS.CLOSURE.WATERMARK}
        </p>
      </div>
    </div>
  );
}
