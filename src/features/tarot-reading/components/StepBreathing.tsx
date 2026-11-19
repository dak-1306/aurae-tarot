"use client";

import { Button } from "@/components/ui/Button";
import { UI_TEXTS } from "@/constants/app";
import type { BreathingPhase } from "@/features/tarot-reading/hooks/useTarotFlow";
import { cn } from "@/utils/cn";

interface StepBreathingProps {
  readonly question: string;
  readonly phase: BreathingPhase;
  readonly canSkip: boolean;
  readonly onSkip: () => void;
}

const PHASE_TEXT_MAP: Record<BreathingPhase, string> = {
  inhale: UI_TEXTS.BREATHING.PHASE_INHALE,
  hold: UI_TEXTS.BREATHING.PHASE_HOLD,
  exhale: UI_TEXTS.BREATHING.PHASE_EXHALE,
};

export function StepBreathing({
  question,
  phase,
  canSkip,
  onSkip,
}: StepBreathingProps) {
  return (
    <section className="mx-auto flex h-full max-w-xl flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Vùng sóng đồng tâm tỏa chậm từ nội dung trung tâm */}
      <div className="relative flex h-56 w-56 sm:h-64 sm:w-64 items-center justify-center shrink-0">
        {/* Quầng sáng nền thở theo nhịp */}
        <div
          className={cn(
            "absolute inset-6 rounded-full breathing-aura blur-2xl transition-transform duration-1000 ease-in-out",
            phase === "inhale" && "scale-110",
            phase === "hold" && "scale-125",
            phase === "exhale" && "scale-90",
          )}
        />

        {/* 3 đợt sóng nước tĩnh lặng lan tỏa nối tiếp từ tâm */}
        <span aria-hidden="true" className="breathing-wave breathing-wave-1" />
        <span aria-hidden="true" className="breathing-wave breathing-wave-2" />
        <span aria-hidden="true" className="breathing-wave breathing-wave-3" />

        {/* Vòng bao ngoài phản hồi theo pha hít / giữ / thở */}
        <div
          className={cn(
            "relative z-10 flex h-32 w-32 sm:h-36 sm:w-36 items-center justify-center rounded-full breathing-ring-outer transition-transform duration-1000 ease-in-out",
            phase === "inhale" && "scale-110",
            phase === "hold" && "scale-115",
            phase === "exhale" && "scale-95",
          )}
        >
          {/* Tâm của cơn sóng ở chính giữa */}
          <div className="h-20 w-20 rounded-full breathing-ring-inner flex items-center justify-center">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full breathing-core-dot transition-transform duration-1000 ease-in-out",
                phase === "inhale" && "scale-125",
                phase === "hold" && "scale-150",
                phase === "exhale" && "scale-90",
              )}
            />
          </div>
        </div>
      </div>

      <h2 className="mt-4 font-serif text-2xl sm:text-3xl font-semibold ink-accent">
        {PHASE_TEXT_MAP[phase]}
      </h2>

      <p className="mt-2 max-w-md text-xs sm:text-sm leading-relaxed ink-secondary">
        {UI_TEXTS.BREATHING.INSTRUCTION}
      </p>

      <blockquote className="mt-5 rounded-2xl surface-card px-4 py-3 font-serif text-sm sm:text-base italic ink-primary line-clamp-3">
        &ldquo;{question}&rdquo;
      </blockquote>

      <div className="mt-6 h-11 shrink-0">
        {canSkip && (
          <Button variant="ghost" size="sm" onClick={onSkip}>
            {UI_TEXTS.BREATHING.BTN_SKIP}
          </Button>
        )}
      </div>
    </section>
  );
}
