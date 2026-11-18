"use client";

import { useCallback, useEffect, useState } from "react";
import { TAROT_CONFIG } from "@/constants/app";
import { preloadCardsInBatches } from "@/features/tarot-reading/utils/imagePreloader";
import type { ReadingSession } from "@/types/tarot";

export type BreathingPhase = "inhale" | "hold" | "exhale";

interface UseRitualTimersParams {
  readonly session: ReadingSession | null;
  readonly setStep: (step: ReadingSession["step"], updatedAt: string) => void;
}

export function useRitualTimers({ session, setStep }: UseRitualTimersParams) {
  const [breathingPhase, setBreathingPhase] =
    useState<BreathingPhase>("inhale");
  const [canSkipBreathing, setCanSkipBreathing] = useState(false);

  // Tải trước & giải mã ngầm bộ bài trong lúc Hít thở / Xào bài / Chuẩn bị rút
  useEffect(() => {
    if (!session) return;

    const controller = new AbortController();

    if (
      session.step === "breathing" ||
      session.step === "shuffling" ||
      session.step === "drawing"
    ) {
      const fanCardIds = session.fanPool.map((item) => item.cardId);
      void preloadCardsInBatches(fanCardIds, {
        batchSize: 12,
        signal: controller.signal,
      });
    }

    if (session.clarifierFanPool.length > 0) {
      const clarifierIds = session.clarifierFanPool.map((item) => item.cardId);
      void preloadCardsInBatches(clarifierIds, {
        batchSize: 12,
        signal: controller.signal,
      });
    }

    return () => {
      controller.abort();
    };
  }, [session?.id, session?.step, session?.clarifierFanPool.length]);

  // Điều khiển nhịp hít thở 3.2s
  useEffect(() => {
    if (session?.step !== "breathing") {
      return;
    }

    const resetTimer = setTimeout(() => {
      setBreathingPhase("inhale");
      setCanSkipBreathing(false);
    }, 0);

    const holdTimer = setTimeout(
      () => setBreathingPhase("hold"),
      Math.round(TAROT_CONFIG.BREATHING_DURATION_MS * 0.4),
    );

    const exhaleTimer = setTimeout(
      () => setBreathingPhase("exhale"),
      Math.round(TAROT_CONFIG.BREATHING_DURATION_MS * 0.65),
    );

    const skipEnableTimer = setTimeout(
      () => setCanSkipBreathing(true),
      TAROT_CONFIG.BREATHING_SKIP_DELAY_MS,
    );

    const finishTimer = setTimeout(
      () => setStep("shuffling", new Date().toISOString()),
      TAROT_CONFIG.BREATHING_DURATION_MS,
    );

    return () => {
      clearTimeout(resetTimer);
      clearTimeout(holdTimer);
      clearTimeout(exhaleTimer);
      clearTimeout(skipEnableTimer);
      clearTimeout(finishTimer);
    };
  }, [session?.id, session?.step, setStep]);

  // Điều khiển hiệu ứng xào bài 1.5s -> mở dàn bài vòng cung
  useEffect(() => {
    if (session?.step !== "shuffling") {
      return;
    }

    const shuffleTimer = setTimeout(
      () => setStep("drawing", new Date().toISOString()),
      TAROT_CONFIG.SHUFFLE_DURATION_MS,
    );

    return () => {
      clearTimeout(shuffleTimer);
    };
  }, [session?.id, session?.step, setStep]);

  const skipBreathingStep = useCallback(() => {
    if (session?.step !== "breathing") return;
    setStep("shuffling", new Date().toISOString());
  }, [session?.step, setStep]);

  return {
    breathingPhase,
    canSkipBreathing,
    skipBreathingStep,
  };
}
