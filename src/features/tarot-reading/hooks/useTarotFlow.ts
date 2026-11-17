"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STORAGE_KEYS, TAROT_CONFIG, UI_TEXTS } from "@/constants/app";
import {
  streamCumulativeDeepDive,
  streamInitialSynthesis,
} from "@/features/tarot-reading/services/tarotAiService";
import {
  clearCurrentSession,
  deleteReadingHistoryItem,
  getCurrentSession,
  getReadingHistory,
  saveCurrentSession,
  upsertReadingHistoryItem,
} from "@/features/tarot-reading/services/tarotStorageService";
import {
  createShuffledFanPool,
  pickClarifierCardFromFanPool,
  pickInitialCardFromFanPool,
} from "@/features/tarot-reading/utils/deckUtils";
import { useTarotStore } from "@/stores/useTarotStore";
import type {
  DeepDiveRound,
  DeepDiveRoundNumber,
  ReadingSession,
  ThemeMode,
  TopicId,
} from "@/types/tarot";

export type BreathingPhase = "inhale" | "hold" | "exhale";

function createSessionId(): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `tarot_${Date.now()}_${randomPart}`;
}

function readPersistedTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!raw) return "dark";
    const parsed = JSON.parse(raw) as { theme?: unknown };
    return parsed.theme === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function writePersistedTheme(theme: ThemeMode): void {
  if (typeof window === "undefined") return;
  try {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify({ theme }),
    );
  } catch {
    // Bỏ qua lỗi quota storage
  }
}

function repairRestoredSession(session: ReadingSession): ReadingSession {
  const normalizedStep =
    session.step === "breathing" || session.step === "shuffling"
      ? "drawing"
      : session.step;

  const revealedInitialCards = session.initialCards.map((card) => ({
    ...card,
    isRevealed: true,
  }));

  const usedInitialIds = new Set(revealedInitialCards.map((c) => c.cardId));
  const needsInitialFanRebuild =
    normalizedStep === "drawing" && session.fanPool.length === 0;

  const repairedFanPool = needsInitialFanRebuild
    ? createShuffledFanPool(
        TAROT_CONFIG.INITIAL_FAN_POOL_SIZE,
        session.allowReversed,
        usedInitialIds,
      )
    : session.fanPool;

  const hasValidClarifierFan =
    Boolean(session.pendingDeepDiveQuestion) &&
    session.clarifierFanPool.length > 0;

  return {
    ...session,
    step: normalizedStep,
    initialCards: revealedInitialCards,
    fanPool: repairedFanPool,
    pendingDeepDiveQuestion: hasValidClarifierFan
      ? session.pendingDeepDiveQuestion
      : null,
    clarifierFanPool: hasValidClarifierFan ? session.clarifierFanPool : [],
  };
}

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
  const updateFanDrawState = useTarotStore((state) => state.updateFanDrawState);
  const revealInitialCard = useTarotStore((state) => state.revealInitialCard);
  const setStreamingSynthesis = useTarotStore(
    (state) => state.setStreamingSynthesis,
  );
  const appendSynthesisChunk = useTarotStore(
    (state) => state.appendSynthesisChunk,
  );
  const openClarifierFan = useTarotStore((state) => state.openClarifierFan);
  const closeClarifierFan = useTarotStore((state) => state.closeClarifierFan);
  const addDeepDiveRound = useTarotStore((state) => state.addDeepDiveRound);
  const setStreamingDeepDiveRound = useTarotStore(
    (state) => state.setStreamingDeepDiveRound,
  );
  const appendDeepDiveChunk = useTarotStore(
    (state) => state.appendDeepDiveChunk,
  );
  const setInspectedCard = useTarotStore((state) => state.setInspectedCard);
  const setHistoryOpen = useTarotStore((state) => state.setHistoryOpen);
  const setShareModalOpen = useTarotStore((state) => state.setShareModalOpen);
  const setErrorMessage = useTarotStore((state) => state.setErrorMessage);

  const [breathingPhase, setBreathingPhase] =
    useState<BreathingPhase>("inhale");
  const [canSkipBreathing, setCanSkipBreathing] = useState(false);

  const streamAbortRef = useRef<AbortController | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const abortActiveAsyncTasks = useCallback(() => {
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
      streamAbortRef.current = null;
    }
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    setStreamingSynthesis(false);
    setStreamingDeepDiveRound(null);
  }, [setStreamingDeepDiveRound, setStreamingSynthesis]);

  // 1. Khôi phục dữ liệu & theme từ localStorage khi mở ứng dụng
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

      const restoredSession = currentRes.data
        ? repairRestoredSession(currentRes.data)
        : null;

      hydrateStore(restoredSession, historyRes.data ?? [], savedTheme);
    }

    void loadPersistedState();

    return () => {
      isMounted = false;
      abortActiveAsyncTasks();
    };
  }, [abortActiveAsyncTasks, hydrateStore]);

  const toggleTheme = useCallback(() => {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    writePersistedTheme(nextTheme);
  }, [setTheme, theme]);

  // 2. Đồng bộ tự động phiên hiện tại xuống localStorage
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

  // 3. Chạy AI Streaming phân tích tổng quan 3 lá sau khi người dùng rút đủ 3 lá
  const triggerSynthesisStream = useCallback(
    async (targetSession: ReadingSession) => {
      abortActiveAsyncTasks();
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
      abortActiveAsyncTasks,
      appendSynthesisChunk,
      persistSessionSnapshot,
      setErrorMessage,
      setStep,
      setStreamingSynthesis,
    ],
  );

  // 4. Điều khiển nhịp hít thở 3-5s (Step 2)
  useEffect(() => {
    if (session?.step !== "breathing") {
      return;
    }

    const resetTimer = setTimeout(() => {
      setBreathingPhase("inhale");
      setCanSkipBreathing(false);
    }, 0);

    const holdTimer = setTimeout(
      () => {
        setBreathingPhase("hold");
      },
      Math.round(TAROT_CONFIG.BREATHING_DURATION_MS * 0.4),
    );

    const exhaleTimer = setTimeout(
      () => {
        setBreathingPhase("exhale");
      },
      Math.round(TAROT_CONFIG.BREATHING_DURATION_MS * 0.65),
    );

    const skipEnableTimer = setTimeout(() => {
      setCanSkipBreathing(true);
    }, TAROT_CONFIG.BREATHING_SKIP_DELAY_MS);

    const finishTimer = setTimeout(() => {
      setStep("shuffling", new Date().toISOString());
    }, TAROT_CONFIG.BREATHING_DURATION_MS);

    return () => {
      clearTimeout(resetTimer);
      clearTimeout(holdTimer);
      clearTimeout(exhaleTimer);
      clearTimeout(skipEnableTimer);
      clearTimeout(finishTimer);
    };
  }, [session?.id, session?.step, setStep]);

  // 5. Điều khiển hiệu ứng xào bài 1.5s (Step 3 -> mở dàn bài vòng cung Step 4)
  useEffect(() => {
    if (session?.step !== "shuffling") {
      return;
    }

    const shuffleTimer = setTimeout(() => {
      setStep("drawing", new Date().toISOString());
    }, TAROT_CONFIG.SHUFFLE_DURATION_MS);

    return () => {
      clearTimeout(shuffleTimer);
    };
  }, [session?.id, session?.step, setStep]);

  // Handler Step 1: Khởi tạo phiên trải bài với trọn bộ 78 lá úp
  const startNewIntention = useCallback(
    async (topicId: TopicId, rawQuestion: string, allowReversed: boolean) => {
      const trimmedQuestion = rawQuestion.trim();
      if (!trimmedQuestion) {
        setErrorMessage(UI_TEXTS.INTENTION.ERROR_EMPTY_QUESTION);
        return;
      }

      abortActiveAsyncTasks();
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

      setSession(newSession);
      await saveCurrentSession(newSession);
    },
    [abortActiveAsyncTasks, setErrorMessage, setSession],
  );

  const skipBreathingStep = useCallback(() => {
    if (session?.step !== "breathing") return;
    setStep("shuffling", new Date().toISOString());
  }, [session?.step, setStep]);

  // Handler Step 4: Người dùng chạm vào lá bài trong vòng cung -> Bay vào slot & Lật 3D
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
      updateFanDrawState(
        pickResult.updatedFanPool,
        pickResult.updatedInitialCards,
        nowIso,
      );

      // Kích hoạt hiệu ứng lật bài 3D sau khi lá bài bay vào ô
      const pickedIdx = pickResult.pickedPositionIndex;
      setTimeout(() => {
        revealInitialCard(pickedIdx, new Date().toISOString());
      }, TAROT_CONFIG.CARD_FLIP_DELAY_MS);

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
      await saveCurrentSession(updatedSnapshot);

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

  // Handler Step 6A: Mở bộ bài bổ trợ để tự rút 1 lá
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

  // Handler Step 6B: Tự chạm chọn 1 lá trên bộ bài bổ trợ
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

      abortActiveAsyncTasks();
      const controller = new AbortController();
      streamAbortRef.current = controller;

      const nowIso = new Date().toISOString();
      const newRound: DeepDiveRound = {
        round: nextRoundNumber,
        question: session.pendingDeepDiveQuestion,
        clarifierCard: drawnClarifier,
        aiResponse: "",
        createdAt: nowIso,
      };

      setErrorMessage(null);
      addDeepDiveRound(newRound, nowIso);
      setStreamingDeepDiveRound(nextRoundNumber);

      const sessionSnapshotForAi: ReadingSession = {
        ...session,
        step: "deep-dive",
        pendingDeepDiveQuestion: null,
        clarifierFanPool: [],
        deepDiveRounds: [...session.deepDiveRounds, newRound],
        updatedAt: nowIso,
      };

      try {
        for await (const chunk of streamCumulativeDeepDive(
          sessionSnapshotForAi,
          newRound,
          controller.signal,
        )) {
          if (controller.signal.aborted) return;
          appendDeepDiveChunk(nextRoundNumber, chunk, new Date().toISOString());
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
      abortActiveAsyncTasks,
      addDeepDiveRound,
      appendDeepDiveChunk,
      isStreamingSynthesis,
      persistSessionSnapshot,
      session,
      setErrorMessage,
      setStreamingDeepDiveRound,
      streamingDeepDiveRound,
    ],
  );

  const resetToNewReading = useCallback(async () => {
    abortActiveAsyncTasks();
    setInspectedCard(null);
    setShareModalOpen(false);
    setSession(null);
    await clearCurrentSession();
  }, [abortActiveAsyncTasks, setInspectedCard, setSession, setShareModalOpen]);

  const openHistorySession = useCallback(
    async (targetSession: ReadingSession) => {
      abortActiveAsyncTasks();
      setInspectedCard(null);
      setHistoryOpen(false);
      const repaired = repairRestoredSession(targetSession);
      setSession(repaired);
      await saveCurrentSession(repaired);
    },
    [abortActiveAsyncTasks, setHistoryOpen, setInspectedCard, setSession],
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
