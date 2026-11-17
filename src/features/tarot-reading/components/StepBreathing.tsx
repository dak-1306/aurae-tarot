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
      <div className="relative flex h-44 w-44 sm:h-52 sm:w-52 items-center justify-center shrink-0">
        <div
          className={cn(
            "absolute inset-0 rounded-full breathing-aura blur-2xl transition-transform duration-1000 ease-in-out",
            phase === "inhale" && "scale-110",
            phase === "hold" && "scale-125",
            phase === "exhale" && "scale-90",
          )}
        />

        <div
          className={cn(
            "flex h-32 w-32 sm:h-36 sm:w-36 items-center justify-center rounded-full breathing-ring-outer transition-transform duration-1000 ease-in-out",
            phase === "inhale" && "scale-110",
            phase === "hold" && "scale-115",
            phase === "exhale" && "scale-95",
          )}
        >
          <div className="h-20 w-20 rounded-full breathing-ring-inner flex items-center justify-center">
            <span className="h-2.5 w-2.5 rounded-full breathing-core-dot animate-pulse" />
          </div>
        </div>
      </div>

      <h2 className="mt-5 font-serif text-2xl sm:text-3xl font-semibold ink-accent">
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
