"use client";

import { useCallback, useRef } from "react";
import { UI_TEXTS } from "@/constants/app";
import {
  streamCumulativeDeepDive,
  streamInitialSynthesis,
} from "@/features/tarot-reading/services/tarotAiService";
import { useTarotStore } from "@/stores/useTarotStore";
import type { DeepDiveRound, ReadingSession } from "@/types/tarot";

interface UseTarotAiStreamParams {
  readonly persistSessionSnapshot: (snapshot: ReadingSession) => Promise<void>;
}

export function useTarotAiStream({
  persistSessionSnapshot,
}: UseTarotAiStreamParams) {
  const setStep = useTarotStore((state) => state.setStep);
  const setStreamingSynthesis = useTarotStore(
    (state) => state.setStreamingSynthesis,
  );
  const appendSynthesisChunk = useTarotStore(
    (state) => state.appendSynthesisChunk,
  );
  const setStreamingDeepDiveRound = useTarotStore(
    (state) => state.setStreamingDeepDiveRound,
  );
  const appendDeepDiveChunk = useTarotStore(
    (state) => state.appendDeepDiveChunk,
  );
  const setErrorMessage = useTarotStore((state) => state.setErrorMessage);

  const streamAbortRef = useRef<AbortController | null>(null);

  const abortStreams = useCallback(() => {
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
      streamAbortRef.current = null;
    }
    setStreamingSynthesis(false);
    setStreamingDeepDiveRound(null);
  }, [setStreamingDeepDiveRound, setStreamingSynthesis]);

  const triggerSynthesisStream = useCallback(
    async (targetSession: ReadingSession) => {
      abortStreams();
      const controller = new AbortController();
      streamAbortRef.current = controller;

      setStreamingSynthesis(true);
      setErrorMessage(null);

      try {
        for await (const chunk of streamInitialSynthesis(
          targetSession,
          controller.signal,
        )) {
          if (controller.signal.aborted) return;
          appendSynthesisChunk(chunk, new Date().toISOString());
        }

        if (controller.signal.aborted) return;

        const completedAt = new Date().toISOString();
        setStep("deep-dive", completedAt);
        setStreamingSynthesis(false);

        const latestSession = useTarotStore.getState().session;
        if (latestSession) {
          await persistSessionSnapshot(latestSession);
        }
      } catch {
        if (!controller.signal.aborted) {
          setStreamingSynthesis(false);
          setErrorMessage(UI_TEXTS.ERRORS.AI_STREAM_FAILED);
        }
      }
    },
    [
      abortStreams,
      appendSynthesisChunk,
      persistSessionSnapshot,
      setErrorMessage,
      setStep,
      setStreamingSynthesis,
    ],
  );

  const triggerDeepDiveStream = useCallback(
    async (sessionSnapshot: ReadingSession, newRound: DeepDiveRound) => {
      abortStreams();
      const controller = new AbortController();
      streamAbortRef.current = controller;

      setErrorMessage(null);
      setStreamingDeepDiveRound(newRound.round);

      try {
        for await (const chunk of streamCumulativeDeepDive(
          sessionSnapshot,
          newRound,
          controller.signal,
        )) {
          if (controller.signal.aborted) return;
          appendDeepDiveChunk(newRound.round, chunk, new Date().toISOString());
        }

        if (controller.signal.aborted) return;

        setStreamingDeepDiveRound(null);
        const latestSession = useTarotStore.getState().session;
        if (latestSession) {
          await persistSessionSnapshot(latestSession);
        }
      } catch {
        if (!controller.signal.aborted) {
          setStreamingDeepDiveRound(null);
          setErrorMessage(UI_TEXTS.ERRORS.AI_STREAM_FAILED);
        }
      }
    },
    [
      abortStreams,
      appendDeepDiveChunk,
      persistSessionSnapshot,
      setErrorMessage,
      setStreamingDeepDiveRound,
    ],
  );

  return {
    abortStreams,
    triggerSynthesisStream,
    triggerDeepDiveStream,
  };
}
