import { create } from "zustand";
import type {
  DeepDiveRound,
  DeepDiveRoundNumber,
  DrawnCard,
  FanCardItem,
  ReadingSession,
  ReadingStep,
  ThemeMode,
} from "@/types/tarot";

interface TarotStoreState {
  readonly theme: ThemeMode;
  readonly session: ReadingSession | null;
  readonly history: readonly ReadingSession[];
  readonly isHydrated: boolean;
  readonly isStreamingSynthesis: boolean;
  readonly streamingDeepDiveRound: DeepDiveRoundNumber | null;
  readonly inspectedCard: DrawnCard | null;
  readonly isHistoryOpen: boolean;
  readonly isShareModalOpen: boolean;
  readonly errorMessage: string | null;

  readonly setTheme: (theme: ThemeMode) => void;
  readonly hydrateStore: (
    currentSession: ReadingSession | null,
    historyList: readonly ReadingSession[],
    theme: ThemeMode,
  ) => void;
  readonly setSession: (session: ReadingSession | null) => void;
  readonly setHistory: (historyList: readonly ReadingSession[]) => void;
  readonly setStep: (step: ReadingStep, updatedAtIso: string) => void;
  readonly updateFanDrawState: (
    updatedFanPool: readonly FanCardItem[],
    updatedInitialCards: readonly DrawnCard[],
    updatedAtIso: string,
  ) => void;
  readonly revealInitialCard: (
    positionIndex: number,
    updatedAtIso: string,
  ) => void;
  readonly setStreamingSynthesis: (isStreaming: boolean) => void;
  readonly appendSynthesisChunk: (chunk: string, updatedAtIso: string) => void;
  readonly openClarifierFan: (
    followUpQuestion: string,
    clarifierFanPool: readonly FanCardItem[],
    updatedAtIso: string,
  ) => void;
  readonly closeClarifierFan: (updatedAtIso: string) => void;
  readonly addDeepDiveRound: (
    round: DeepDiveRound,
    updatedAtIso: string,
  ) => void;
  readonly setStreamingDeepDiveRound: (
    round: DeepDiveRoundNumber | null,
  ) => void;
  readonly appendDeepDiveChunk: (
    roundNumber: DeepDiveRoundNumber,
    chunk: string,
    updatedAtIso: string,
  ) => void;
  readonly setInspectedCard: (card: DrawnCard | null) => void;
  readonly setHistoryOpen: (isOpen: boolean) => void;
  readonly setShareModalOpen: (isOpen: boolean) => void;
  readonly setErrorMessage: (message: string | null) => void;
}

export const useTarotStore = create<TarotStoreState>((set) => ({
  theme: "dark",
  session: null,
  history: [],
  isHydrated: false,
  isStreamingSynthesis: false,
  streamingDeepDiveRound: null,
  inspectedCard: null,
  isHistoryOpen: false,
  isShareModalOpen: false,
  errorMessage: null,

  setTheme: (theme) => set({ theme }),

  hydrateStore: (currentSession, historyList, theme) =>
    set({
      session: currentSession,
      history: historyList,
      theme,
      isHydrated: true,
    }),

  setSession: (session) => set({ session, errorMessage: null }),

  setHistory: (historyList) => set({ history: historyList }),

  setStep: (step, updatedAtIso) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          step,
          updatedAt: updatedAtIso,
        },
      };
    }),

  updateFanDrawState: (updatedFanPool, updatedInitialCards, updatedAtIso) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          fanPool: updatedFanPool,
          initialCards: updatedInitialCards,
          updatedAt: updatedAtIso,
        },
      };
    }),

  revealInitialCard: (positionIndex, updatedAtIso) =>
    set((state) => {
      if (!state.session) return state;
      const updatedCards = state.session.initialCards.map((item) =>
        item.positionIndex === positionIndex
          ? { ...item, isRevealed: true }
          : item,
      );
      return {
        session: {
          ...state.session,
          initialCards: updatedCards,
          updatedAt: updatedAtIso,
        },
      };
    }),

  setStreamingSynthesis: (isStreaming) =>
    set({ isStreamingSynthesis: isStreaming }),

  appendSynthesisChunk: (chunk, updatedAtIso) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          synthesisText: state.session.synthesisText + chunk,
          updatedAt: updatedAtIso,
        },
      };
    }),

  openClarifierFan: (followUpQuestion, clarifierFanPool, updatedAtIso) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          pendingDeepDiveQuestion: followUpQuestion,
          clarifierFanPool,
          updatedAt: updatedAtIso,
        },
      };
    }),

  closeClarifierFan: (updatedAtIso) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          pendingDeepDiveQuestion: null,
          clarifierFanPool: [],
          updatedAt: updatedAtIso,
        },
      };
    }),

  addDeepDiveRound: (round, updatedAtIso) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          step: "deep-dive",
          pendingDeepDiveQuestion: null,
          clarifierFanPool: [],
          deepDiveRounds: [...state.session.deepDiveRounds, round],
          updatedAt: updatedAtIso,
        },
      };
    }),

  setStreamingDeepDiveRound: (round) => set({ streamingDeepDiveRound: round }),

  appendDeepDiveChunk: (roundNumber, chunk, updatedAtIso) =>
    set((state) => {
      if (!state.session) return state;
      const updatedRounds = state.session.deepDiveRounds.map((item) =>
        item.round === roundNumber
          ? { ...item, aiResponse: item.aiResponse + chunk }
          : item,
      );
      return {
        session: {
          ...state.session,
          deepDiveRounds: updatedRounds,
          updatedAt: updatedAtIso,
        },
      };
    }),

  setInspectedCard: (card) => set({ inspectedCard: card }),

  setHistoryOpen: (isOpen) => set({ isHistoryOpen: isOpen }),

  setShareModalOpen: (isOpen) => set({ isShareModalOpen: isOpen }),

  setErrorMessage: (message) => set({ errorMessage: message }),
}));
