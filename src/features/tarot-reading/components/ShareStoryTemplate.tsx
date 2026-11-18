import { Compass, Coins, Droplets, Flame, Wind } from "lucide-react";
import { TAROT_CONFIG, TOPIC_PRESETS, UI_TEXTS } from "@/constants/app";
import { TAROT_CARD_MAP } from "@/constants/tarot-deck";
import { EditorialMarkdown } from "@/features/tarot-reading/components/EditorialMarkdown";
import { toRomanNumeral } from "@/features/tarot-reading/utils/deckUtils";
import type { DrawnCard, ReadingSession, SuitType } from "@/types/tarot";
import { cn } from "@/utils/cn";
import { formatSessionTimestamp } from "@/utils/dateFormat";

export type ShareExportMode = "full" | "story";

interface ShareStoryTemplateProps {
  readonly templateRef?: React.RefObject<HTMLDivElement | null>;
  readonly session: ReadingSession;
  readonly mode?: ShareExportMode;
  readonly cardDataUrls?: Readonly<Record<string, string>>;
  readonly inlinePreview?: boolean;
}

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

function ExportCardArtwork({
  card,
  cardDataUrls,
  frameClassName,
  compactFallback = false,
}: {
  readonly card: DrawnCard;
  readonly cardDataUrls?: Readonly<Record<string, string>>;
  readonly frameClassName: string;
  readonly compactFallback?: boolean;
}) {
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
 * Rút trích đoạn chiêm nghiệm cốt lõi (loại bỏ dòng tiêu đề ###) cho thẻ Story 9:16
 */
function extractStoryClosingInsight(synthesisText: string): string {
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

export function ShareStoryTemplate({
  templateRef,
  session,
  mode = "full",
  cardDataUrls,
  inlinePreview = false,
}: ShareStoryTemplateProps) {
  const topicLabel = TOPIC_PRESETS[session.topicId].label;

  const canvasElement =
    mode === "story" ? (
      /* ==================== MẪU 2: THẺ STORY 9:16 (1080 x 1920) ==================== */
      <div
        ref={templateRef}
        style={{
          width: `${TAROT_CONFIG.SHARE_IMAGE_WIDTH}px`,
          height: `${TAROT_CONFIG.SHARE_IMAGE_HEIGHT}px`,
        }}
        className="story-canvas-bg flex flex-col justify-between p-14 ink-primary overflow-hidden"
      >
        {/* Header */}
        <div className="text-center story-divider-top pb-8">
          <p className="font-serif text-3xl font-bold tracking-[0.35em] ink-accent">
            {UI_TEXTS.HEADER.BRAND_NAME}
          </p>
          <p className="mt-2.5 text-lg tracking-widest uppercase ink-secondary">
            {topicLabel} • {formatSessionTimestamp(session.createdAt)}
          </p>
        </div>

        {/* Ý niệm chính */}
        <div className="my-5 rounded-3xl surface-card px-10 py-7 text-center">
          <p className="text-base uppercase tracking-[0.25em] ink-accent mb-3">
            {UI_TEXTS.COMMON.QUESTION_LABEL}
          </p>
          <p className="font-serif text-[34px] italic leading-snug ink-primary line-clamp-3">
            &ldquo;{session.question}&rdquo;
          </p>
        </div>

        {/* 3 Lá bài nền tảng kèm hình ảnh thật */}
        <div>
          <p className="text-center text-lg font-semibold tracking-[0.28em] ink-accent mb-5">
            {UI_TEXTS.CLOSURE.TEMPLATE_CORE_TITLE}
          </p>

          <div className="grid grid-cols-3 gap-6">
            {session.initialCards.map((card, idx) => {
              const def = TAROT_CARD_MAP[card.cardId];
              if (!def) return null;
              const isReversed = card.orientation === "reversed";

              return (
                <div
                  key={`story_card_${idx}`}
                  className="flex flex-col items-center justify-between rounded-3xl story-card-box p-5 text-center"
                >
                  <span className="rounded-full slot-label-pill-active px-4 py-1 text-sm font-medium">
                    {card.positionLabel}
                  </span>

                  <ExportCardArtwork
                    card={card}
                    cardDataUrls={cardDataUrls}
                    frameClassName="w-[172px] h-[284px] my-3.5"
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
                        "mt-2 text-sm font-semibold uppercase tracking-wider",
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

        {/* Tóm lược các lá bài bổ trợ nếu có */}
        {session.deepDiveRounds.length > 0 && (
          <div className="mt-5 rounded-3xl surface-card px-8 py-5">
            <p className="text-base font-semibold tracking-[0.25em] ink-accent mb-3.5">
              {UI_TEXTS.CLOSURE.TEMPLATE_CLARIFIER_TITLE}
            </p>
            <div className="space-y-3">
              {session.deepDiveRounds.map((round) => {
                const def = TAROT_CARD_MAP[round.clarifierCard.cardId];
                const isReversed =
                  round.clarifierCard.orientation === "reversed";

                return (
                  <div
                    key={`story_round_${round.round}`}
                    className="flex items-center justify-between gap-4 border-b line-neutral-subtle pb-2.5 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <ExportCardArtwork
                        card={round.clarifierCard}
                        cardDataUrls={cardDataUrls}
                        frameClassName="w-[46px] h-[76px]"
                        compactFallback
                      />
                      <p className="text-lg ink-primary line-clamp-2">
                        <span className="font-semibold ink-gold">
                          #{round.round}.
                        </span>{" "}
                        {round.question}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-serif text-lg font-semibold ink-accent">
                        {def?.nameVi}
                      </p>
                      <p className="text-xs uppercase tracking-wider ink-secondary">
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

        {/* Thông điệp đọng lại */}
        <div className="mt-5 rounded-3xl surface-card px-9 py-7">
          <p className="text-base font-semibold tracking-[0.25em] ink-accent mb-3">
            {UI_TEXTS.CLOSURE.TEMPLATE_SYNTHESIS_TITLE}
          </p>
          <div className="line-clamp-5 overflow-hidden">
            <EditorialMarkdown
              content={extractStoryClosingInsight(session.synthesisText)}
              variant="export"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 story-divider-bottom text-center">
          <p className="text-base tracking-[0.35em] ink-secondary">
            {UI_TEXTS.CLOSURE.WATERMARK}
          </p>
        </div>
      </div>
    ) : (
      /* ==================== MẪU 1: PHIẾU CHIÊM NGHIỆM TRỌN VẸN (TỰ GIÃN CHIỀU CAO) ==================== */
      <div
        ref={templateRef}
        style={{
          width: `${TAROT_CONFIG.SHARE_IMAGE_WIDTH}px`,
        }}
        className="story-canvas-bg flex flex-col gap-9 p-14 ink-primary"
      >
        {/* 1. Phần đầu & Ý niệm chính */}
        <div className="text-center story-divider-top pb-8">
          <p className="font-serif text-4xl font-bold tracking-[0.35em] ink-accent">
            {UI_TEXTS.HEADER.BRAND_NAME}
          </p>
          <p className="mt-3 text-lg tracking-widest uppercase ink-secondary">
            {topicLabel} • {formatSessionTimestamp(session.createdAt)}
          </p>
        </div>

        <div className="rounded-3xl surface-card px-11 py-9 text-center">
          <p className="text-base uppercase tracking-[0.26em] ink-accent mb-3.5">
            {UI_TEXTS.COMMON.QUESTION_LABEL}
          </p>
          <p className="font-serif text-[34px] italic leading-relaxed ink-primary">
            &ldquo;{session.question}&rdquo;
          </p>
        </div>

        {/* 2. Bộ 3 lá bài nền tảng kèm hình ảnh minh họa */}
        <div>
          <p className="text-center text-lg font-semibold tracking-[0.28em] ink-accent mb-6">
            {UI_TEXTS.CLOSURE.TEMPLATE_CORE_TITLE}
          </p>

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

        {/* 3. Toàn bộ Luận giải tổng quan */}
        <div className="rounded-3xl surface-card px-11 py-10">
          <p className="text-lg font-semibold tracking-[0.26em] ink-accent border-b line-accent-subtle pb-4 mb-6">
            {UI_TEXTS.CLOSURE.TEMPLATE_SYNTHESIS_TITLE}
          </p>
          <EditorialMarkdown content={session.synthesisText} variant="export" />
        </div>

        {/* 4. Hành trình Đào sâu (Câu hỏi phụ + Hình lá phụ + Toàn bộ luận giải sâu) */}
        {session.deepDiveRounds.length > 0 && (
          <div className="space-y-6">
            <p className="text-center text-lg font-semibold tracking-[0.28em] ink-accent pt-2">
              {UI_TEXTS.CLOSURE.TEMPLATE_CLARIFIER_TITLE}
            </p>

            {session.deepDiveRounds.map((round) => {
              const clarifierDef = TAROT_CARD_MAP[round.clarifierCard.cardId];
              const isReversed = round.clarifierCard.orientation === "reversed";

              return (
                <div
                  key={`full_round_${round.round}`}
                  className="rounded-3xl surface-card p-9 space-y-6"
                >
                  {/* Phần đầu nhịp hỏi sâu: Lá bổ trợ bên trái + Câu hỏi & Tên lá bên phải */}
                  <div className="flex items-center gap-7 border-b line-accent-subtle pb-6">
                    <ExportCardArtwork
                      card={round.clarifierCard}
                      cardDataUrls={cardDataUrls}
                      frameClassName="w-[138px] h-[228px]"
                    />

                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full slot-label-pill-active px-4 py-1 text-sm font-semibold">
                          {UI_TEXTS.DEEP_DIVE.CLARIFIER_BADGE_PREFIX}
                          {round.round}
                        </span>
                        <span className="font-serif text-xl font-bold ink-accent">
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

                  {/* Toàn bộ nội dung luận giải sâu */}
                  <EditorialMarkdown
                    content={round.aiResponse}
                    variant="export"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Phần kết & Watermark */}
        <div className="pt-8 story-divider-bottom text-center">
          <p className="text-lg tracking-[0.35em] ink-secondary">
            {UI_TEXTS.CLOSURE.WATERMARK}
          </p>
        </div>
      </div>
    );

  if (inlinePreview) {
    return canvasElement;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 top-0 -z-50 opacity-0 pointer-events-none select-none overflow-hidden"
    >
      {canvasElement}
    </div>
  );
}
