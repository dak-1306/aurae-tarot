import { STORAGE_KEYS, TAROT_CONFIG } from "@/constants/app";
import { createShuffledFanPool } from "@/features/tarot-reading/utils/deckUtils";
import type { ReadingSession, ThemeMode } from "@/types/tarot";

export function createSessionId(): string {
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `aurae_${Date.now()}_${randomPart}`;
}

export function readPersistedTheme(): ThemeMode {
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

export function writePersistedTheme(theme: ThemeMode): void {
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

export function isValidReadingSession(
  candidate: unknown,
): candidate is ReadingSession {
  if (!candidate || typeof candidate !== "object") {
    return false;
  }

  const record = candidate as Partial<ReadingSession>;
  return (
    typeof record.id === "string" &&
    record.id.length > 0 &&
    typeof record.question === "string" &&
    Array.isArray(record.initialCards)
  );
}

export function repairRestoredSession(
  rawSession: unknown,
): ReadingSession | null {
  if (!isValidReadingSession(rawSession)) {
    return null;
  }

  const normalizedStep =
    rawSession.step === "breathing" || rawSession.step === "shuffling"
      ? "drawing"
      : rawSession.step;

  const revealedInitialCards = rawSession.initialCards.map((card) => ({
    ...card,
    isRevealed: true,
  }));

  const safeFanPool = Array.isArray(rawSession.fanPool)
    ? rawSession.fanPool
    : [];
  const usedInitialIds = new Set(revealedInitialCards.map((c) => c.cardId));
  const needsInitialFanRebuild =
    normalizedStep === "drawing" && safeFanPool.length === 0;

  const repairedFanPool = needsInitialFanRebuild
    ? createShuffledFanPool(
        TAROT_CONFIG.INITIAL_FAN_POOL_SIZE,
        Boolean(rawSession.allowReversed),
        usedInitialIds,
      )
    : safeFanPool;

  const safeClarifierPool = Array.isArray(rawSession.clarifierFanPool)
    ? rawSession.clarifierFanPool
    : [];
  const hasValidClarifierFan =
    Boolean(rawSession.pendingDeepDiveQuestion) && safeClarifierPool.length > 0;

  const safeDeepDiveRounds = Array.isArray(rawSession.deepDiveRounds)
    ? rawSession.deepDiveRounds.map((round) => ({
        ...round,
        clarifierCard: round.clarifierCard
          ? { ...round.clarifierCard, isRevealed: true }
          : round.clarifierCard,
      }))
    : [];

  return {
    ...rawSession,
    step: normalizedStep,
    initialCards: revealedInitialCards,
    fanPool: repairedFanPool,
    deepDiveRounds: safeDeepDiveRounds,
    synthesisText:
      typeof rawSession.synthesisText === "string"
        ? rawSession.synthesisText
        : "",
    pendingDeepDiveQuestion: hasValidClarifierFan
      ? rawSession.pendingDeepDiveQuestion
      : null,
    clarifierFanPool: hasValidClarifierFan ? safeClarifierPool : [],
  };
}
