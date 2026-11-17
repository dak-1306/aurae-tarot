"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ChipButton } from "@/components/ui/ChipButton";
import { TextArea, ToggleSwitch } from "@/components/ui/FormField";
import { TOPIC_LIST, TOPIC_PRESETS, UI_TEXTS } from "@/constants/app";
import { IntentionBackdrop } from "@/features/tarot-reading/components/IntentionBackdrop";
import { OracleMascot } from "@/features/tarot-reading/components/OracleMascot";
import type { TopicId } from "@/types/tarot";

interface StepIntentionProps {
  readonly errorMessage: string | null;
  readonly onSubmitIntention: (
    topicId: TopicId,
    question: string,
    allowReversed: boolean,
  ) => void;
}

export function StepIntention({
  errorMessage,
  onSubmitIntention,
}: StepIntentionProps) {
  const [selectedTopic, setSelectedTopic] = useState<TopicId>("general");
  const [question, setQuestion] = useState("");
  const [allowReversed, setAllowReversed] = useState(true);

  const currentPreset = TOPIC_PRESETS[selectedTopic];

  function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmitIntention(selectedTopic, question, allowReversed);
  }

  return (
    <section className="relative flex h-full w-full flex-col overflow-hidden">
      <IntentionBackdrop />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col px-4 py-3 sm:py-5 lg:grid lg:grid-cols-12 lg:items-center lg:gap-10 lg:px-8">
        {/* CỘT TRÁI (PC >= lg): Mascot cỡ lớn + 3 dòng chỉ dẫn La Mã */}
        <aside className="hidden lg:flex lg:col-span-5 lg:flex-col lg:items-center lg:justify-center lg:text-center">
          <OracleMascot variant="hero" className="h-56 w-56 xl:h-64 xl:w-64" />

          <div className="my-5 h-px w-40 editorial-guide-divider" />

          <ol className="w-full max-w-sm space-y-3.5 text-left">
            {UI_TEXTS.INTENTION.GUIDE_STEPS.map((step) => (
              <li key={step.numeral} className="flex items-baseline gap-3.5">
                <span className="w-6 shrink-0 font-serif text-sm font-semibold tracking-widest ink-gold">
                  {step.numeral}.
                </span>
                <div className="min-w-0">
                  <p className="font-serif text-base font-semibold leading-snug ink-primary">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed ink-secondary">
                    {step.caption}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </aside>

        {/* CỘT PHẢI (PC) / TOÀN KHUNG (MOBILE): Form đặt ý niệm */}
        <div className="flex flex-1 min-h-0 flex-col lg:col-span-7 lg:flex-initial lg:justify-center">
          <div className="shrink-0 text-center mb-3 lg:hidden">
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight ink-primary">
              {UI_TEXTS.INTENTION.HEADING}
            </h1>
            <p className="mt-1 text-xs sm:text-sm ink-secondary">
              {UI_TEXTS.INTENTION.SUBHEADING}
            </p>
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="surface-elevated flex flex-1 min-h-0 flex-col rounded-2xl overflow-hidden lg:flex-initial"
          >
            <div className="flex-1 min-h-0 overflow-y-auto mystic-scrollbar p-4 sm:p-6 lg:overflow-visible lg:p-7 space-y-4">
              <div className="hidden lg:flex lg:items-baseline lg:justify-between lg:gap-4 lg:border-b lg:line-accent-subtle lg:pb-3.5">
                <h1 className="font-serif text-2xl xl:text-3xl font-semibold tracking-tight ink-primary">
                  {UI_TEXTS.INTENTION.HEADING}
                </h1>
                <span className="text-xs ink-secondary">
                  {UI_TEXTS.INTENTION.SUBHEADING}
                </span>
              </div>

              {/* Chọn chủ đề */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] ink-accent mb-2">
                  {UI_TEXTS.INTENTION.LABEL_TOPICS}
                </label>
                <div className="flex flex-wrap gap-2">
                  {TOPIC_LIST.map((topic) => (
                    <ChipButton
                      key={topic.id}
                      variant="tag"
                      active={topic.id === selectedTopic}
                      onClick={() => setSelectedTopic(topic.id)}
                    >
                      {topic.label}
                    </ChipButton>
                  ))}
                </div>
              </div>

              {/* Ô nhập câu hỏi */}
              <div>
                <TextArea
                  rows={2}
                  value={question}
                  hasError={Boolean(errorMessage)}
                  onChange={setQuestion}
                  placeholder={UI_TEXTS.INTENTION.INPUT_PLACEHOLDER}
                />
                {errorMessage && (
                  <p className="mt-1.5 text-xs ink-warning">{errorMessage}</p>
                )}
              </div>

              {/* 3 Gợi ý tinh tuyển */}
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] ink-secondary mb-2">
                  {UI_TEXTS.INTENTION.LABEL_SAMPLES}
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {currentPreset.sampleQuestions.map((sample) => (
                    <ChipButton
                      key={sample}
                      variant="card"
                      active={question === sample}
                      onClick={() => setQuestion(sample)}
                    >
                      {sample}
                    </ChipButton>
                  ))}
                </div>
              </div>

              {/* Tùy chọn lá bài ngược */}
              <div className="flex items-center justify-between gap-4 rounded-lg surface-inset px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium ink-primary">
                    {UI_TEXTS.INTENTION.LABEL_REVERSED_TOGGLE}
                  </p>
                  <p className="text-xs ink-secondary truncate">
                    {UI_TEXTS.INTENTION.REVERSED_HINT}
                  </p>
                </div>

                <ToggleSwitch
                  checked={allowReversed}
                  onToggle={() => setAllowReversed((prev) => !prev)}
                  aria-label={UI_TEXTS.ARIA.TOGGLE_REVERSED}
                />
              </div>
            </div>

            {/* Nút hành động chính dáng Thẻ bài viền chỉ kép */}
            <div className="shrink-0 surface-footer-bar px-4 py-3 sm:px-6 lg:px-7 safe-area-bottom">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                icon={<Sparkles className="h-4 w-4" />}
              >
                {UI_TEXTS.INTENTION.BTN_SUBMIT}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
