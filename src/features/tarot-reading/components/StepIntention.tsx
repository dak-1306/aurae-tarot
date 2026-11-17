"use client";

import { useState } from "react";
import { Sparkles, Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ChipButton } from "@/components/ui/ChipButton";
import { TextArea, ToggleSwitch } from "@/components/ui/FormField";
import { TOPIC_LIST, TOPIC_PRESETS, UI_TEXTS } from "@/constants/app";
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
    <section className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden px-4 py-3 sm:py-6">
      {/* Tiêu đề cô đọng */}
      <div className="shrink-0 text-center mb-3 sm:mb-5">
        <div className="mx-auto mb-2 hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full brand-orb">
          <Compass className="h-5 w-5 ink-accent" />
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-semibold tracking-tight ink-primary">
          {UI_TEXTS.INTENTION.HEADING}
        </h1>
        <p className="mx-auto mt-1 max-w-xl text-xs sm:text-sm leading-relaxed ink-secondary">
          {UI_TEXTS.INTENTION.SUBHEADING}
        </p>
      </div>

      {/* Khung thẻ nâng cao với vùng cuộn nội bộ + nút hành động ghim cố định ở đáy */}
      <form
        onSubmit={handleFormSubmit}
        className="surface-elevated flex flex-1 min-h-0 flex-col rounded-3xl overflow-hidden"
      >
        <div className="flex-1 min-h-0 overflow-y-auto mystic-scrollbar p-4 sm:p-6 space-y-5">
          {/* Chọn chủ đề */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest ink-accent mb-2">
              {UI_TEXTS.INTENTION.LABEL_TOPICS}
            </label>
            <div className="flex flex-wrap gap-2">
              {TOPIC_LIST.map((topic) => (
                <ChipButton
                  key={topic.id}
                  variant="pill"
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
              onChange={setQuestion}
              placeholder={UI_TEXTS.INTENTION.INPUT_PLACEHOLDER}
            />
            {errorMessage && (
              <p className="mt-1.5 text-xs sm:text-sm ink-warning">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Gợi ý câu hỏi mẫu theo chủ đề */}
          <div>
            <span className="block text-xs font-medium ink-secondary mb-2">
              {UI_TEXTS.INTENTION.LABEL_SAMPLES}
            </span>
            <div className="grid grid-cols-1 gap-2">
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

          {/* Bật/Tắt lá bài ngược */}
          <div className="flex items-center justify-between gap-4 rounded-2xl surface-inset px-4 py-3">
            <div>
              <p className="text-sm font-medium ink-primary">
                {UI_TEXTS.INTENTION.LABEL_REVERSED_TOGGLE}
              </p>
              <p className="text-xs ink-secondary mt-0.5">
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

        {/* Chân thẻ ghim cố định: Luôn chạm được nút bắt đầu trên mọi màn hình */}
        <div className="shrink-0 surface-footer-bar px-4 py-3 sm:px-6 safe-area-bottom">
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
    </section>
  );
}
