"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ChipButton } from "@/components/ui/ChipButton";
import { TextArea, ToggleSwitch } from "@/components/ui/FormField";
import { TOPIC_LIST, TOPIC_PRESETS, UI_TEXTS } from "@/constants/app";
import { OracleMascot } from "@/features/tarot-reading/components/OracleMascot";
import type { TopicId } from "@/types/tarot";
import { PortalBackdrop } from "./PortalBackdrop";

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
      {/* Nền cánh cổng cho Mobile (< lg) */}
      <PortalBackdrop variant="intention" className="lg:hidden" />

      <div className="relative z-10 flex h-full w-full flex-col px-4 py-3 sm:py-5 lg:grid lg:grid-cols-12 lg:p-0">
        {/* NỬA TRÁI (PC >= lg): Cánh cổng kiến trúc & Thiên thần nằm chính giữa vòm */}
        <aside className="hidden lg:relative lg:col-span-6 lg:flex lg:h-full lg:items-center lg:justify-center lg:overflow-hidden">
          <PortalBackdrop variant="intention" />
          <OracleMascot
            variant="hero"
            className="relative z-10 h-64 w-64 xl:h-72 xl:w-72 translate-y-4"
          />
        </aside>

        {/* NỬA PHẢI (PC >= lg): Trang nhập liệu mở phẳng / MOBILE: Gọn gàng không đóng hộp */}
        <div className="relative flex flex-1 min-h-0 flex-col lg:col-span-6 lg:h-full lg:justify-center lg:px-10 xl:px-16">
          {/* Vệt phân tách dọc mờ dần ở hai đầu trên PC */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute left-0 top-14 bottom-14 w-px editorial-vertical-divider"
          />

          {/* Tiêu đề Mobile */}
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
            className="flex flex-1 min-h-0 flex-col overflow-hidden lg:flex-initial lg:mx-auto lg:w-full lg:max-w-xl"
          >
            <div className="flex-1 min-h-0 overflow-y-auto mystic-scrollbar px-1 py-2 sm:px-3 lg:overflow-visible lg:p-0 space-y-4 lg:space-y-5">
              {/* Tiêu đề PC với đường kẻ mờ tan hai đầu */}
              <div className="hidden lg:block">
                <h1 className="font-serif text-3xl xl:text-4xl font-semibold tracking-tight ink-primary">
                  {UI_TEXTS.INTENTION.HEADING}
                </h1>
                <p className="mt-1.5 text-sm ink-secondary">
                  {UI_TEXTS.INTENTION.SUBHEADING}
                </p>
                <div
                  aria-hidden="true"
                  className="mt-4 h-px w-full editorial-guide-divider opacity-70"
                />
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

            {/* Nút hành động chính */}
            <div className="shrink-0 px-1 pt-3 pb-1 sm:px-3 lg:px-0 lg:pt-5 lg:pb-0 safe-area-bottom">
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
