import { TAROT_CONFIG, TOPIC_PRESETS, UI_TEXTS } from "@/constants/app";
import { TAROT_CARD_MAP } from "@/constants/tarot-deck";
import { toRomanNumeral } from "@/features/tarot-reading/utils/deckUtils";
import type { ReadingSession } from "@/types/tarot";
import { formatSessionTimestamp } from "@/utils/dateFormat";

interface ShareStoryTemplateProps {
  readonly templateRef: React.RefObject<HTMLDivElement | null>;
  readonly session: ReadingSession;
}

export function ShareStoryTemplate({
  templateRef,
  session,
}: ShareStoryTemplateProps) {
  const topicLabel = TOPIC_PRESETS[session.topicId].label;
  const synthesisParagraphs = session.synthesisText
    .split("\n\n")
    .filter((p) => p.trim().length > 0);
  const closingInsight =
    synthesisParagraphs[synthesisParagraphs.length - 1] ??
    session.synthesisText;

  return (
    <div
      aria-hidden="true"
      className="fixed -left-[9999px] top-0 pointer-events-none select-none"
    >
      <div
        ref={templateRef}
        style={{
          width: `${TAROT_CONFIG.SHARE_IMAGE_WIDTH}px`,
          height: `${TAROT_CONFIG.SHARE_IMAGE_HEIGHT}px`,
        }}
        className="story-canvas-bg flex flex-col justify-between p-16 ink-primary"
      >
        <div className="text-center story-divider-top pb-10">
          <p className="font-serif text-3xl font-bold tracking-[0.35em] ink-accent">
            {UI_TEXTS.HEADER.BRAND_NAME}
          </p>
          <p className="mt-3 text-xl tracking-widest uppercase ink-secondary">
            {topicLabel} • {formatSessionTimestamp(session.createdAt)}
          </p>
        </div>

        <div className="my-8 rounded-3xl surface-card px-12 py-10 text-center">
          <p className="text-lg uppercase tracking-[0.25em] ink-accent mb-4">
            {UI_TEXTS.COMMON.QUESTION_LABEL}
          </p>
          <p className="font-serif text-4xl italic leading-snug ink-primary">
            &ldquo;{session.question}&rdquo;
          </p>
        </div>

        <div>
          <p className="text-center text-xl font-semibold tracking-[0.28em] ink-accent mb-6">
            {UI_TEXTS.CLOSURE.TEMPLATE_CORE_TITLE}
          </p>

          <div className="grid grid-cols-3 gap-6">
            {session.initialCards.map((card, idx) => {
              const def = TAROT_CARD_MAP[card.cardId];
              if (!def) return null;
              const isReversed = card.orientation === "reversed";
              const numeral =
                def.arcana === "major"
                  ? toRomanNumeral(def.number)
                  : String(def.number);

              return (
                <div
                  key={`story_card_${idx}`}
                  className="flex flex-col items-center justify-between rounded-3xl story-card-box p-6 text-center h-[390px]"
                >
                  <span className="rounded-full slot-label-pill-active px-4 py-1 text-base">
                    {card.positionLabel}
                  </span>

                  <div className="flex h-28 w-28 items-center justify-center rounded-full story-numeral-orb">
                    <span className="font-serif text-3xl font-bold ink-accent">
                      {numeral}
                    </span>
                  </div>

                  <div>
                    <p className="font-serif text-2xl font-bold ink-primary">
                      {def.nameVi}
                    </p>
                    <p className="mt-1 text-base ink-secondary">{def.nameEn}</p>
                    <p
                      className={`mt-2 text-base font-semibold uppercase tracking-wider ${
                        isReversed ? "ink-gold" : "ink-accent"
                      }`}
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

        {session.deepDiveRounds.length > 0 && (
          <div className="mt-8 rounded-3xl surface-card px-10 py-7">
            <p className="text-lg font-semibold tracking-[0.25em] ink-accent mb-4">
              {UI_TEXTS.CLOSURE.TEMPLATE_CLARIFIER_TITLE}
            </p>
            <div className="space-y-3">
              {session.deepDiveRounds.map((round) => {
                const def = TAROT_CARD_MAP[round.clarifierCard.cardId];
                return (
                  <div
                    key={`story_round_${round.round}`}
                    className="flex items-center justify-between text-xl border-b line-neutral-subtle pb-2 last:border-b-0 last:pb-0"
                  >
                    <span className="ink-primary truncate max-w-[65%]">
                      #{round.round}. {round.question}
                    </span>
                    <span className="font-serif font-semibold ink-accent">
                      {def?.nameVi} (
                      {round.clarifierCard.orientation === "reversed"
                        ? UI_TEXTS.ORIENTATION.REVERSED
                        : UI_TEXTS.ORIENTATION.UPRIGHT}
                      )
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-3xl surface-card px-10 py-9">
          <p className="text-lg font-semibold tracking-[0.25em] ink-accent mb-3">
            {UI_TEXTS.CLOSURE.TEMPLATE_SYNTHESIS_TITLE}
          </p>
          <p className="text-2xl leading-relaxed ink-primary line-clamp-6">
            {closingInsight}
          </p>
        </div>

        <div className="pt-8 story-divider-bottom text-center">
          <p className="text-lg tracking-[0.35em] ink-secondary">
            {UI_TEXTS.CLOSURE.WATERMARK}
          </p>
        </div>
      </div>
    </div>
  );
}
