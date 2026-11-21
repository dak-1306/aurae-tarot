"use client";

import { useCallback, useRef } from "react";
import { UI_TEXTS } from "@/constants/app";
import {
  streamCumulativeDeepDive,
  streamInitialSynthesis,
} from "@/features/tarot-reading/services/tarotAiService";
import { parseStreamWithSuggestions } from "@/features/tarot-reading/utils/streamSuggestionsParser";
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
  const setSynthesisStreamOutput = useTarotStore(
    (state) => state.setSynthesisStreamOutput,
  );
  const setStreamingDeepDiveRound = useTarotStore(
    (state) => state.setStreamingDeepDiveRound,
  );
  const setDeepDiveStreamOutput = useTarotStore(
    (state) => state.setDeepDiveStreamOutput,
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

      let rawBuffer = "";

      try {
        for await (const chunk of streamInitialSynthesis(
          targetSession,
          controller.signal,
        )) {
          if (controller.signal.aborted) return;
          rawBuffer += chunk;
          const parsed = parseStreamWithSuggestions(rawBuffer, false);
          setSynthesisStreamOutput(
            parsed.bodyText,
            parsed.suggestions,
            new Date().toISOString(),
          );
        }

        if (controller.signal.aborted) return;

        const finalParsed = parseStreamWithSuggestions(rawBuffer, true);
        const completedAt = new Date().toISOString();
        setSynthesisStreamOutput(
          finalParsed.bodyText,
          finalParsed.suggestions,
          completedAt,
        );
        setStep("deep-dive", completedAt);
        setStreamingSynthesis(false);

        const latestSession = useTarotStore.getState().session;
        if (latestSession) {
          await persistSessionSnapshot(latestSession);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setStreamingSynthesis(false);
          const message =
            error instanceof Error && error.message
              ? error.message
              : UI_TEXTS.ERRORS.AI_STREAM_FAILED;
          setErrorMessage(message);
        }
      }
    },
    [
      abortStreams,
      persistSessionSnapshot,
      setErrorMessage,
      setStep,
      setStreamingSynthesis,
      setSynthesisStreamOutput,
    ],
  );

  const triggerDeepDiveStream = useCallback(
    async (sessionSnapshot: ReadingSession, newRound: DeepDiveRound) => {
      abortStreams();
      const controller = new AbortController();
      streamAbortRef.current = controller;

      setErrorMessage(null);
      setStreamingDeepDiveRound(newRound.round);

      let rawBuffer = "";

      try {
        for await (const chunk of streamCumulativeDeepDive(
          sessionSnapshot,
          newRound,
          controller.signal,
        )) {
          if (controller.signal.aborted) return;
          rawBuffer += chunk;
          const parsed = parseStreamWithSuggestions(rawBuffer, false);
          setDeepDiveStreamOutput(
            newRound.round,
            parsed.bodyText,
            parsed.suggestions,
            new Date().toISOString(),
          );
        }

        if (controller.signal.aborted) return;

        const finalParsed = parseStreamWithSuggestions(rawBuffer, true);
        setDeepDiveStreamOutput(
          newRound.round,
          finalParsed.bodyText,
          finalParsed.suggestions,
          new Date().toISOString(),
        );
        setStreamingDeepDiveRound(null);

        const latestSession = useTarotStore.getState().session;
        if (latestSession) {
          await persistSessionSnapshot(latestSession);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setStreamingDeepDiveRound(null);
          const message =
            error instanceof Error && error.message
              ? error.message
              : UI_TEXTS.ERRORS.AI_STREAM_FAILED;
          setErrorMessage(message);
        }
      }
    },
    [
      abortStreams,
      persistSessionSnapshot,
      setDeepDiveStreamOutput,
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
