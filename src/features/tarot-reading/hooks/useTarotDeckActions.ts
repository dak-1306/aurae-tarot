"use client";

import { useCallback, useRef } from "react";
import { TAROT_CONFIG, UI_TEXTS } from "@/constants/app";
import { saveCurrentSession } from "@/features/tarot-reading/services/tarotStorageService";
import {
  createShuffledFanPool,
  pickClarifierCardFromFanPool,
  pickInitialCardFromFanPool,
} from "@/features/tarot-reading/utils/deckUtils";
import { preloadCardImageById } from "@/features/tarot-reading/utils/imagePreloader";
import { useTarotStore } from "@/stores/useTarotStore";
import type {
  DeepDiveRound,
  DeepDiveRoundNumber,
  ReadingSession,
} from "@/types/tarot";

interface UseTarotDeckActionsParams {
  readonly session: ReadingSession | null;
  readonly isStreamingSynthesis: boolean;
  readonly streamingDeepDiveRound: DeepDiveRoundNumber | null;
  readonly triggerSynthesisStream: (
    targetSession: ReadingSession,
  ) => Promise<void>;
  readonly triggerDeepDiveStream: (
    sessionSnapshot: ReadingSession,
    newRound: DeepDiveRound,
  ) => Promise<void>;
}

export function useTarotDeckActions({
  session,
  isStreamingSynthesis,
  streamingDeepDiveRound,
  triggerSynthesisStream,
  triggerDeepDiveStream,
}: UseTarotDeckActionsParams) {
  const setStep = useTarotStore((state) => state.setStep);
  const updateFanDrawState = useTarotStore((state) => state.updateFanDrawState);
  const revealInitialCard = useTarotStore((state) => state.revealInitialCard);
  const openClarifierFan = useTarotStore((state) => state.openClarifierFan);
  const closeClarifierFan = useTarotStore((state) => state.closeClarifierFan);
  const addDeepDiveRound = useTarotStore((state) => state.addDeepDiveRound);
  const setErrorMessage = useTarotStore((state) => state.setErrorMessage);

  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, []);

  // Rút 1 lá từ vòng cung -> Đợi bay & ảnh giải mã xong mới lật mặt ngửa
  const pickCardFromInitialFan = useCallback(
    async (targetFanId: string) => {
      if (!session || session.step !== "drawing") return;

      const pickResult = pickInitialCardFromFanPool(
        session.fanPool,
        session.initialCards,
        targetFanId,
        session.topicId,
      );

      if (!pickResult) return;

      const nowIso = new Date().toISOString();
      const pickedIdx = pickResult.pickedPositionIndex;
      const pickedCard = pickResult.updatedInitialCards[pickedIdx];

      updateFanDrawState(
        pickResult.updatedFanPool,
        pickResult.updatedInitialCards,
        nowIso,
      );

      const minFlightDelay = new Promise<void>((resolve) => {
        setTimeout(resolve, TAROT_CONFIG.CARD_FLIP_DELAY_MS);
      });

      const imageReadyPromise = pickedCard
        ? preloadCardImageById(pickedCard.cardId, 1400)
        : Promise.resolve(true);

      const revealedSnapshotCards = pickResult.updatedInitialCards.map((c) => ({
        ...c,
        isRevealed: true,
      }));
      const updatedSnapshot: ReadingSession = {
        ...session,
        fanPool: pickResult.updatedFanPool,
        initialCards: revealedSnapshotCards,
        updatedAt: nowIso,
      };
      const savePromise = saveCurrentSession(updatedSnapshot);

      await Promise.all([minFlightDelay, imageReadyPromise]);
      revealInitialCard(pickedIdx, new Date().toISOString());

      await savePromise;

      if (
        pickResult.updatedInitialCards.length ===
        TAROT_CONFIG.INITIAL_DRAW_COUNT
      ) {
        transitionTimerRef.current = setTimeout(() => {
          const synthesisTime = new Date().toISOString();
          setStep("synthesis", synthesisTime);
          const sessionForSynthesis: ReadingSession = {
            ...updatedSnapshot,
            step: "synthesis",
            updatedAt: synthesisTime,
          };
          void saveCurrentSession(sessionForSynthesis);
          void triggerSynthesisStream(sessionForSynthesis);
        }, TAROT_CONFIG.REVEAL_TO_SYNTHESIS_DELAY_MS);
      }
    },
    [
      revealInitialCard,
      session,
      setStep,
      triggerSynthesisStream,
      updateFanDrawState,
    ],
  );

  // Mở bộ bài bổ trợ để tự rút 1 lá
  const requestClarifierFanDraw = useCallback(
    (rawFollowUpQuestion: string) => {
      if (!session) return;
      if (isStreamingSynthesis || streamingDeepDiveRound !== null) return;

      const trimmedQuestion = rawFollowUpQuestion.trim();
      if (!trimmedQuestion) {
        setErrorMessage(UI_TEXTS.DEEP_DIVE.ERROR_EMPTY_DEEP_DIVE);
        return;
      }

      if (session.deepDiveRounds.length >= TAROT_CONFIG.MAX_DEEP_DIVE_ROUNDS) {
        return;
      }

      const usedIds = new Set<string>([
        ...session.initialCards.map((c) => c.cardId),
        ...session.deepDiveRounds.map((r) => r.clarifierCard.cardId),
      ]);

      const clarifierFanPool = createShuffledFanPool(
        TAROT_CONFIG.CLARIFIER_FAN_POOL_SIZE,
        session.allowReversed,
        usedIds,
      );

      if (clarifierFanPool.length === 0) {
        setErrorMessage(UI_TEXTS.ERRORS.DECK_EXHAUSTED);
        return;
      }

      setErrorMessage(null);
      openClarifierFan(
        trimmedQuestion,
        clarifierFanPool,
        new Date().toISOString(),
      );
    },
    [
      isStreamingSynthesis,
      openClarifierFan,
      session,
      setErrorMessage,
      streamingDeepDiveRound,
    ],
  );

  const cancelClarifierFanDraw = useCallback(() => {
    closeClarifierFan(new Date().toISOString());
  }, [closeClarifierFan]);

  // Chạm chọn 1 lá trên bộ bài bổ trợ -> Tải sẵn ảnh & Stream luận giải cộng dồn
  const pickClarifierFromFan = useCallback(
    async (targetFanId: string) => {
      if (!session || !session.pendingDeepDiveQuestion) return;
      if (isStreamingSynthesis || streamingDeepDiveRound !== null) return;

      const nextRoundNumber = (session.deepDiveRounds.length +
        1) as DeepDiveRoundNumber;
      if (nextRoundNumber > TAROT_CONFIG.MAX_DEEP_DIVE_ROUNDS) return;

      const drawnClarifier = pickClarifierCardFromFanPool(
        session.clarifierFanPool,
        targetFanId,
        nextRoundNumber,
        session.pendingDeepDiveQuestion,
      );

      if (!drawnClarifier) return;

      clearTransitionTimer();
      await preloadCardImageById(drawnClarifier.cardId, 1200);

      const nowIso = new Date().toISOString();
      const newRound: DeepDiveRound = {
        round: nextRoundNumber,
        question: session.pendingDeepDiveQuestion,
        clarifierCard: drawnClarifier,
        aiResponse: "",
        createdAt: nowIso,
      };

      addDeepDiveRound(newRound, nowIso);

      const sessionSnapshotForAi: ReadingSession = {
        ...session,
        step: "deep-dive",
        pendingDeepDiveQuestion: null,
        clarifierFanPool: [],
        deepDiveRounds: [...session.deepDiveRounds, newRound],
        updatedAt: nowIso,
      };

      await triggerDeepDiveStream(sessionSnapshotForAi, newRound);
    },
    [
      addDeepDiveRound,
      clearTransitionTimer,
      isStreamingSynthesis,
      session,
      streamingDeepDiveRound,
      triggerDeepDiveStream,
    ],
  );

  return {
    clearTransitionTimer,
    pickCardFromInitialFan,
    requestClarifierFanDraw,
    cancelClarifierFanDraw,
    pickClarifierFromFan,
  };
}
