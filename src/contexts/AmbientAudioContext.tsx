"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { AUDIO_CONFIG, STORAGE_KEYS } from "@/constants/app";

interface AmbientAudioContextValue {
  readonly isSoundEnabled: boolean;
  readonly toggleSound: () => void;
}

const AmbientAudioContext = createContext<AmbientAudioContextValue | null>(
  null,
);

const soundListeners = new Set<() => void>();

function emitSoundPrefChange() {
  for (const listener of soundListeners) {
    listener();
  }
}

function subscribeSoundPref(callback: () => void): () => void {
  soundListeners.add(callback);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.SOUND_PREF) {
      callback();
    }
  };
  window.addEventListener("storage", handleStorage);

  return () => {
    soundListeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function getSoundPrefSnapshot(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SOUND_PREF);
    return raw !== "muted" && raw !== '"muted"';
  } catch {
    return true;
  }
}

function getSoundPrefServerSnapshot(): boolean {
  return true;
}

function writeSoundPref(enabled: boolean): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEYS.SOUND_PREF,
      enabled ? "enabled" : "muted",
    );
  } catch {
    // Bỏ qua nếu trình duyệt chặn storage
  }
  emitSoundPrefChange();
}

function safeSetVolume(audio: HTMLAudioElement, volume: number): void {
  try {
    audio.volume = Math.max(0, Math.min(1, volume));
  } catch {
    // iOS Safari giữ volume ở mức phần cứng, bỏ qua lỗi gán thuộc tính
  }
}

export function AmbientAudioProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const isSoundEnabled = useSyncExternalStore(
    subscribeSoundPref,
    getSoundPrefSnapshot,
    getSoundPrefServerSnapshot,
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number | null>(null);
  const isUnlockedRef = useRef(false);
  const enabledRef = useRef<boolean>(true);

  const cancelFade = useCallback(() => {
    if (fadeRafRef.current !== null) {
      cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    }
  }, []);

  const rampVolume = useCallback(
    (
      audio: HTMLAudioElement,
      targetVolume: number,
      durationMs: number,
      onComplete?: () => void,
    ) => {
      cancelFade();
      const startVolume = audio.volume;
      const delta = targetVolume - startVolume;

      if (Math.abs(delta) < 0.005 || durationMs <= 0) {
        safeSetVolume(audio, targetVolume);
        onComplete?.();
        return;
      }

      const startTime = performance.now();

      const step = (now: number) => {
        const progress = Math.min(1, (now - startTime) / durationMs);
        const eased = 1 - (1 - progress) * (1 - progress);
        safeSetVolume(audio, startVolume + delta * eased);

        if (progress < 1) {
          fadeRafRef.current = requestAnimationFrame(step);
        } else {
          fadeRafRef.current = null;
          onComplete?.();
        }
      };

      fadeRafRef.current = requestAnimationFrame(step);
    },
    [cancelFade],
  );

  const startPlaybackWithFade = useCallback(
    async (durationMs: number = AUDIO_CONFIG.FADE_IN_DURATION_MS) => {
      const audio = audioRef.current;
      // Kiểm tra kép cả ref lẫn localStorage để không bao giờ phát nhầm khi đang muted
      if (!audio || !enabledRef.current || !getSoundPrefSnapshot()) return;

      try {
        if (audio.paused) {
          safeSetVolume(audio, 0);
          await audio.play();
        }
        // Nếu người dùng vừa bấm tắt trong lúc Promise play() đang chờ thì dừng ngay
        if (!enabledRef.current || !getSoundPrefSnapshot()) {
          audio.pause();
          safeSetVolume(audio, 0);
          return;
        }
        isUnlockedRef.current = true;
        rampVolume(audio, AUDIO_CONFIG.TARGET_VOLUME, durationMs);
      } catch {
        isUnlockedRef.current = false;
      }
    },
    [rampVolume],
  );

  const pausePlaybackWithFade = useCallback(
    (durationMs: number = AUDIO_CONFIG.FADE_OUT_DURATION_MS) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (audio.paused) {
        cancelFade();
        safeSetVolume(audio, 0);
        return;
      }

      rampVolume(audio, 0, durationMs, () => {
        audio.pause();
      });
    },
    [cancelFade, rampVolume],
  );

  // Đồng bộ mỗi khi trạng thái Bật/Tắt thay đổi (bao gồm cả nhịp sau hydration)
  useEffect(() => {
    enabledRef.current = isSoundEnabled;
    if (!isSoundEnabled) {
      pausePlaybackWithFade(200);
    }
  }, [isSoundEnabled, pausePlaybackWithFade]);

  // Khởi tạo đối tượng Audio duy nhất ở tầng Root Layout
  useEffect(() => {
    const initialEnabled = getSoundPrefSnapshot();
    enabledRef.current = initialEnabled;

    const audio = new Audio(AUDIO_CONFIG.SRC);
    audio.loop = true;
    audio.preload = initialEnabled ? "metadata" : "none";
    safeSetVolume(audio, 0);
    audioRef.current = audio;

    // Làm dịu điểm giao nhau ở 1.2 giây cuối bài để vòng lặp mượt mà
    const handleTimeUpdate = () => {
      if (
        !enabledRef.current ||
        audio.paused ||
        fadeRafRef.current !== null ||
        !Number.isFinite(audio.duration) ||
        audio.duration <= 4
      ) {
        return;
      }

      const remaining = audio.duration - audio.currentTime;
      if (remaining <= 1.2) {
        const ratio = Math.max(0.15, remaining / 1.2);
        safeSetVolume(audio, AUDIO_CONFIG.TARGET_VOLUME * ratio);
      } else if (audio.currentTime <= 1.2) {
        const ratio = Math.max(0.15, audio.currentTime / 1.2);
        safeSetVolume(audio, AUDIO_CONFIG.TARGET_VOLUME * ratio);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);

    // Chỉ tự động phát nếu người dùng KHÔNG tắt âm
    if (initialEnabled) {
      void startPlaybackWithFade(AUDIO_CONFIG.FADE_IN_DURATION_MS);
    }

    const unlockOnFirstGesture = () => {
      if (
        enabledRef.current &&
        getSoundPrefSnapshot() &&
        !isUnlockedRef.current
      ) {
        void startPlaybackWithFade(AUDIO_CONFIG.FADE_IN_DURATION_MS);
      }
      if (isUnlockedRef.current || !enabledRef.current) {
        window.removeEventListener("pointerdown", unlockOnFirstGesture);
        window.removeEventListener("keydown", unlockOnFirstGesture);
      }
    };

    window.addEventListener("pointerdown", unlockOnFirstGesture, {
      passive: true,
    });
    window.addEventListener("keydown", unlockOnFirstGesture, { passive: true });

    // Tự tạm nghỉ khi người dùng chuyển tab hoặc tắt màn hình điện thoại
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pausePlaybackWithFade(450);
      } else if (
        enabledRef.current &&
        getSoundPrefSnapshot() &&
        isUnlockedRef.current
      ) {
        void startPlaybackWithFade(1200);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelFade();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      window.removeEventListener("pointerdown", unlockOnFirstGesture);
      window.removeEventListener("keydown", unlockOnFirstGesture);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [cancelFade, pausePlaybackWithFade, startPlaybackWithFade]);

  const toggleSound = useCallback(() => {
    const nextEnabled = !enabledRef.current;
    enabledRef.current = nextEnabled;
    writeSoundPref(nextEnabled);

    if (nextEnabled) {
      void startPlaybackWithFade(1100);
    } else {
      pausePlaybackWithFade(650);
    }
  }, [pausePlaybackWithFade, startPlaybackWithFade]);

  return (
    <AmbientAudioContext.Provider value={{ isSoundEnabled, toggleSound }}>
      {children}
    </AmbientAudioContext.Provider>
  );
}

export function useAmbientAudio(): AmbientAudioContextValue {
  const ctx = useContext(AmbientAudioContext);
  if (!ctx) {
    throw new Error(
      "useAmbientAudio must be used within an AmbientAudioProvider",
    );
  }
  return ctx;
}
