import { STORAGE_KEYS, TAROT_CONFIG, UI_TEXTS } from "@/constants/app";
import type { ReadingSession, ServiceResult } from "@/types/tarot";

function isBrowserEnvironment(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

export async function getCurrentSession(): Promise<
  ServiceResult<ReadingSession | null>
> {
  if (!isBrowserEnvironment()) {
    return { success: true, data: null };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (!raw) {
      return { success: true, data: null };
    }
    const parsed = JSON.parse(raw) as ReadingSession;
    return { success: true, data: parsed };
  } catch {
    return {
      success: false,
      error: UI_TEXTS.ERRORS.STORAGE_READ_FAILED,
    };
  }
}

export async function saveCurrentSession(
  session: ReadingSession,
): Promise<ServiceResult<ReadingSession>> {
  if (!isBrowserEnvironment()) {
    return { success: true, data: session };
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEYS.CURRENT_SESSION,
      JSON.stringify(session),
    );
    return { success: true, data: session };
  } catch {
    return {
      success: false,
      error: UI_TEXTS.ERRORS.STORAGE_WRITE_FAILED,
    };
  }
}

export async function clearCurrentSession(): Promise<ServiceResult<null>> {
  if (!isBrowserEnvironment()) {
    return { success: true, data: null };
  }

  try {
    window.localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    return { success: true, data: null };
  } catch {
    return {
      success: false,
      error: UI_TEXTS.ERRORS.STORAGE_WRITE_FAILED,
    };
  }
}

export async function getReadingHistory(): Promise<
  ServiceResult<ReadingSession[]>
> {
  if (!isBrowserEnvironment()) {
    return { success: true, data: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.READING_HISTORY);
    if (!raw) {
      return { success: true, data: [] };
    }
    const parsed = JSON.parse(raw) as ReadingSession[];
    return { success: true, data: Array.isArray(parsed) ? parsed : [] };
  } catch {
    return {
      success: false,
      error: UI_TEXTS.ERRORS.STORAGE_READ_FAILED,
    };
  }
}

export async function upsertReadingHistoryItem(
  session: ReadingSession,
): Promise<ServiceResult<ReadingSession[]>> {
  if (!isBrowserEnvironment()) {
    return { success: true, data: [session] };
  }

  try {
    const existingResult = await getReadingHistory();
    const currentList = existingResult.data ?? [];
    const filtered = currentList.filter((item) => item.id !== session.id);
    const updatedList = [session, ...filtered].slice(
      0,
      TAROT_CONFIG.MAX_HISTORY_ITEMS,
    );

    window.localStorage.setItem(
      STORAGE_KEYS.READING_HISTORY,
      JSON.stringify(updatedList),
    );
    return { success: true, data: updatedList };
  } catch {
    return {
      success: false,
      error: UI_TEXTS.ERRORS.STORAGE_WRITE_FAILED,
    };
  }
}

export async function deleteReadingHistoryItem(
  sessionId: string,
): Promise<ServiceResult<ReadingSession[]>> {
  if (!isBrowserEnvironment()) {
    return { success: true, data: [] };
  }

  try {
    const existingResult = await getReadingHistory();
    const currentList = existingResult.data ?? [];
    const updatedList = currentList.filter((item) => item.id !== sessionId);

    window.localStorage.setItem(
      STORAGE_KEYS.READING_HISTORY,
      JSON.stringify(updatedList),
    );
    return { success: true, data: updatedList };
  } catch {
    return {
      success: false,
      error: UI_TEXTS.ERRORS.STORAGE_WRITE_FAILED,
    };
  }
}
