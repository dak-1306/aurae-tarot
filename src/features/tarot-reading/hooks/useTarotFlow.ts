"use client";

import { useCallback, useEffect } from "react";
import { TAROT_CONFIG, UI_TEXTS } from "@/constants/app";
import { useRitualTimers } from "@/features/tarot-reading/hooks/useRitualTimers";
import { useTarotAiStream } from "@/features/tarot-reading/hooks/useTarotAiStream";
import { useTarotDeckActions } from "@/features/tarot-reading/hooks/useTarotDeckActions";
import {
  clearCurrentSession,
  deleteReadingHistoryItem,
  getCurrentSession,
  getReadingHistory,
  saveCurrentSession,
  upsertReadingHistoryItem,
} from "@/features/tarot-reading/services/tarotStorageService";
import { createShuffledFanPool } from "@/features/tarot-reading/utils/deckUtils";
import {
  createSessionId,
  isValidReadingSession,
  readPersistedTheme,
  repairRestoredSession,
  writePersistedTheme,
} from "@/features/tarot-reading/utils/sessionPersistence";
import { useTarotStore } from "@/stores/useTarotStore";
import type { ReadingSession, ThemeMode, TopicId } from "@/types/tarot";

export type { BreathingPhase } from "@/features/tarot-reading/hooks/useRitualTimers";

export function useTarotFlow() {
  const theme = useTarotStore((state) => state.theme);
  const session = useTarotStore((state) => state.session);
  const history = useTarotStore((state) => state.history);
  const isHydrated = useTarotStore((state) => state.isHydrated);
  const isStreamingSynthesis = useTarotStore(
    (state) => state.isStreamingSynthesis,
  );
  const streamingDeepDiveRound = useTarotStore(
    (state) => state.streamingDeepDiveRound,
  );
  const inspectedCard = useTarotStore((state) => state.inspectedCard);
  const isHistoryOpen = useTarotStore((state) => state.isHistoryOpen);
  const isShareModalOpen = useTarotStore((state) => state.isShareModalOpen);
  const errorMessage = useTarotStore((state) => state.errorMessage);

  const setTheme = useTarotStore((state) => state.setTheme);
  const hydrateStore = useTarotStore((state) => state.hydrateStore);
  const setSession = useTarotStore((state) => state.setSession);
  const setHistory = useTarotStore((state) => state.setHistory);
  const setStep = useTarotStore((state) => state.setStep);
  const setInspectedCard = useTarotStore((state) => state.setInspectedCard);
  const setHistoryOpen = useTarotStore((state) => state.setHistoryOpen);
  const setShareModalOpen = useTarotStore((state) => state.setShareModalOpen);
  const setErrorMessage = useTarotStore((state) => state.setErrorMessage);

  const persistSessionSnapshot = useCallback(
    async (snapshot: ReadingSession) => {
      await saveCurrentSession(snapshot);
      if (snapshot.step === "deep-dive" || snapshot.step === "closure") {
        const historyRes = await upsertReadingHistoryItem(snapshot);
        if (historyRes.success && historyRes.data) {
          setHistory(historyRes.data);
        }
      }
    },
    [setHistory],
  );

  const { abortStreams, triggerSynthesisStream, triggerDeepDiveStream } =
    useTarotAiStream({ persistSessionSnapshot });

  const { breathingPhase, canSkipBreathing, skipBreathingStep } =
    useRitualTimers({ session, setStep });

  const {
    clearTransitionTimer,
    pickCardFromInitialFan,
    requestClarifierFanDraw,
    cancelClarifierFanDraw,
    pickClarifierFromFan,
  } = useTarotDeckActions({
    session,
    isStreamingSynthesis,
    streamingDeepDiveRound,
    triggerSynthesisStream,
    triggerDeepDiveStream,
  });

  const abortAllTasks = useCallback(() => {
    abortStreams();
    clearTransitionTimer();
  }, [abortStreams, clearTransitionTimer]);

  // Khôi phục dữ liệu an toàn từ localStorage khi mở ứng dụng
  useEffect(() => {
    let isMounted = true;

    async function loadPersistedState() {
      const savedTheme = readPersistedTheme();
      document.documentElement.setAttribute("data-theme", savedTheme);

      const [currentRes, historyRes] = await Promise.all([
        getCurrentSession(),
        getReadingHistory(),
      ]);

      if (!isMounted) return;

      const restoredSession = repairRestoredSession(currentRes.data);
      const validHistory = Array.isArray(historyRes.data)
        ? historyRes.data.filter(isValidReadingSession)
        : [];

      hydrateStore(restoredSession, validHistory, savedTheme);
    }

    void loadPersistedState();

    return () => {
      isMounted = false;
      abortAllTasks();
    };
  }, [abortAllTasks, hydrateStore]);

  const toggleTheme = useCallback(() => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    writePersistedTheme(nextTheme);
  }, [setTheme, theme]);

  const startNewIntention = useCallback(
    async (topicId: TopicId, rawQuestion: string, allowReversed: boolean) => {
      const trimmedQuestion = rawQuestion.trim();
      if (!trimmedQuestion) {
        setErrorMessage(UI_TEXTS.INTENTION.ERROR_EMPTY_QUESTION);
        return;
      }

      abortAllTasks();
      const nowIso = new Date().toISOString();
      const fanPool = createShuffledFanPool(
        TAROT_CONFIG.INITIAL_FAN_POOL_SIZE,
        allowReversed,
      );

      const newSession: ReadingSession = {
        id: createSessionId(),
        topicId,
        question: trimmedQuestion,
        allowReversed,
        step: "breathing",
        fanPool,
        initialCards: [],
        synthesisText: "",
        deepDiveRounds: [],
        pendingDeepDiveQuestion: null,
        clarifierFanPool: [],
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setErrorMessage(null);
      setSession(newSession);
      await saveCurrentSession(newSession);
    },
    [abortAllTasks, setErrorMessage, setSession],
  );

  const resetToNewReading = useCallback(async () => {
    abortAllTasks();
    setInspectedCard(null);
    setShareModalOpen(false);
    setErrorMessage(null);
    setSession(null);
    await clearCurrentSession();
  }, [
    abortAllTasks,
    setErrorMessage,
    setInspectedCard,
    setSession,
    setShareModalOpen,
  ]);

  const openHistorySession = useCallback(
    async (targetSession: ReadingSession) => {
      abortAllTasks();
      setInspectedCard(null);
      setHistoryOpen(false);
      const repaired = repairRestoredSession(targetSession);
      if (!repaired) return;
      setSession(repaired);
      await saveCurrentSession(repaired);
    },
    [abortAllTasks, setHistoryOpen, setInspectedCard, setSession],
  );

  const removeHistoryItem = useCallback(
    async (sessionId: string) => {
      const res = await deleteReadingHistoryItem(sessionId);
      if (res.success && res.data) {
        setHistory(res.data);
      }
    },
    [setHistory],
  );

  return {
    theme,
    session,
    history,
    isHydrated,
    breathingPhase,
    canSkipBreathing,
    isStreamingSynthesis,
    streamingDeepDiveRound,
    inspectedCard,
    isHistoryOpen,
    isShareModalOpen,
    errorMessage,

    toggleTheme,
    startNewIntention,
    skipBreathingStep,
    pickCardFromInitialFan,
    requestClarifierFanDraw,
    cancelClarifierFanDraw,
    pickClarifierFromFan,
    resetToNewReading,
    openHistorySession,
    removeHistoryItem,
    setInspectedCard,
    setHistoryOpen,
    setShareModalOpen,
  };
}
