"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import {
  computeArcSlotVisual,
  easeOutCubic,
  FAN_PHYSICS,
  getArcGeometry,
  type GapClosureState,
} from "@/features/tarot-reading/utils/fanArcPhysics";
import { preloadCardImageById } from "@/features/tarot-reading/utils/imagePreloader";
import type { FanCardItem } from "@/types/tarot";

interface UseFannedArcPhysicsOptions {
  readonly activeCards: readonly FanCardItem[];
  readonly disabled: boolean;
  readonly compact: boolean;
  readonly onPickCard: (fanId: string) => void;
}

export function useFannedArcPhysics({
  activeCards,
  disabled,
  compact,
  onPickCard,
}: UseFannedArcPhysicsOptions) {
  const total = activeCards.length;

  const mobileSlotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pcSlotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeCardsRef = useRef(activeCards);

  useEffect(() => {
    activeCardsRef.current = activeCards;
  }, [activeCards]);

  const latestNowRef = useRef(0);
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startPosRef = useRef(0);
  const lastXRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const lastWheelTimeRef = useRef(0);
  const gapClosureRef = useRef<GapClosureState | null>(null);
  const lastPreloadedCenterRef = useRef<string | null>(null);

  const syncArcTransforms = useCallback(
    (now: number) => {
      const cards = activeCardsRef.current;
      const count = cards.length;
      if (count === 0) return;

      const isDesktop =
        typeof window !== "undefined" && window.innerWidth >= 768;
      const slotRefs = isDesktop ? pcSlotRefs.current : mobileSlotRefs.current;
      const geometry = getArcGeometry(isDesktop, compact, count);

      let gapSpread = 0;
      let splitIndex = 0;
      const closure = gapClosureRef.current;

      if (closure) {
        if (closure.startTime === null) {
          closure.startTime = now;
        }
        const elapsed = now - closure.startTime;
        if (elapsed >= closure.duration) {
          gapClosureRef.current = null;
        } else {
          gapSpread = 0.5 * (1 - easeOutCubic(elapsed / closure.duration));
          splitIndex = closure.splitIndex;
        }
      }

      const currentPos = positionRef.current;

      for (let idx = 0; idx < count; idx += 1) {
        const el = slotRefs[idx];
        if (!el) continue;

        const visual = computeArcSlotVisual(
          idx,
          count,
          currentPos,
          geometry,
          gapSpread,
          splitIndex,
        );

        if (!visual.visible) {
          if (el.style.visibility !== "hidden") {
            el.style.visibility = "hidden";
          }
          continue;
        }

        if (el.style.visibility !== "visible") {
          el.style.visibility = "visible";
        }
        el.style.zIndex = String(visual.zIndex);
        el.style.transform = visual.transform;
      }
    },
    [compact],
  );

  // Vòng lặp animation 60/120fps thuần GPU
  useEffect(() => {
    if (total === 0) return;

    let rafId = 0;
    let lastFrameTime = performance.now();
    latestNowRef.current = lastFrameTime;

    const tick = (now: number) => {
      latestNowRef.current = now;
      const dt = Math.min(now - lastFrameTime, 32) / 16.667;
      lastFrameTime = now;

      if (!isDraggingRef.current) {
        if (
          Math.abs(velocityRef.current) > FAN_PHYSICS.STOP_VELOCITY_THRESHOLD
        ) {
          positionRef.current += velocityRef.current * dt;
          velocityRef.current *= Math.pow(FAN_PHYSICS.FRICTION_PER_FRAME, dt);
        } else {
          velocityRef.current = 0;

          const isWheelSettled =
            now - lastWheelTimeRef.current > FAN_PHYSICS.WHEEL_SETTLE_DELAY_MS;
          if (isWheelSettled && !gapClosureRef.current) {
            const target = Math.round(positionRef.current);
            const delta = target - positionRef.current;

            if (Math.abs(delta) > FAN_PHYSICS.SNAP_EPSILON) {
              positionRef.current +=
                delta * Math.min(1, FAN_PHYSICS.SNAP_SPEED * dt);
            } else {
              positionRef.current = target;

              const cards = activeCardsRef.current;
              if (cards.length > 0) {
                const centerIdx =
                  ((target % cards.length) + cards.length) % cards.length;
                const centerCard = cards[centerIdx];
                if (
                  centerCard &&
                  lastPreloadedCenterRef.current !== centerCard.cardId
                ) {
                  lastPreloadedCenterRef.current = centerCard.cardId;
                  void preloadCardImageById(centerCard.cardId, 2000);
                }
              }
            }
          }
        }
      }

      syncArcTransforms(now);
      rafId = requestAnimationFrame(tick);
    };

    syncArcTransforms(lastFrameTime);
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [total, syncArcTransforms]);

  // Theo dõi kéo toàn cửa sổ để không bị ngắt quãng khi ngón tay/chuột trượt ra ngoài viền
  useEffect(() => {
    function handleWindowPointerMove(e: PointerEvent) {
      if (!isDraggingRef.current) return;

      const clientX = e.clientX;
      const stepDelta = clientX - lastXRef.current;
      dragDistanceRef.current += Math.abs(stepDelta);

      const now = performance.now();
      const dt = now - lastMoveTimeRef.current;
      if (dt > 0) {
        const instantVel =
          (-stepDelta / FAN_PHYSICS.DRAG_PIXELS_PER_CARD) * (16.667 / dt);
        velocityRef.current = velocityRef.current * 0.45 + instantVel * 0.55;
      }

      lastXRef.current = clientX;
      lastMoveTimeRef.current = now;

      const totalDeltaX = clientX - startXRef.current;
      positionRef.current =
        startPosRef.current - totalDeltaX / FAN_PHYSICS.DRAG_PIXELS_PER_CARD;
    }

    function handleWindowPointerUp() {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      if (
        performance.now() - lastMoveTimeRef.current >
        FAN_PHYSICS.HOLD_CANCEL_INERTIA_MS
      ) {
        velocityRef.current = 0;
      }
    }

    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: true,
    });
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      isDraggingRef.current = true;
      velocityRef.current = 0;
      gapClosureRef.current = null;
      startXRef.current = e.clientX;
      lastXRef.current = e.clientX;
      startPosRef.current = positionRef.current;
      lastMoveTimeRef.current = latestNowRef.current;
      dragDistanceRef.current = 0;
    },
    [],
  );

  const handleWheel = useCallback((e: ReactWheelEvent<HTMLDivElement>) => {
    const dominantDelta =
      Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (dominantDelta === 0) return;

    lastWheelTimeRef.current = latestNowRef.current;
    velocityRef.current = Math.max(
      -FAN_PHYSICS.MAX_WHEEL_VELOCITY,
      Math.min(
        FAN_PHYSICS.MAX_WHEEL_VELOCITY,
        velocityRef.current + dominantDelta / FAN_PHYSICS.WHEEL_DIVISOR,
      ),
    );
  }, []);

  const handleCardTap = useCallback(
    (fanId: string, cardIdx: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;

      if (dragDistanceRef.current < FAN_PHYSICS.TAP_MAX_DRAG_PX) {
        velocityRef.current = 0;
        if (activeCardsRef.current.length > 2) {
          positionRef.current -= 0.5;
          gapClosureRef.current = {
            splitIndex: cardIdx,
            startTime: null,
            duration: FAN_PHYSICS.GAP_CLOSURE_DURATION_MS,
          };
        }
        onPickCard(fanId);
      }
    },
    [disabled, onPickCard],
  );

  return {
    mobileSlotRefs,
    pcSlotRefs,
    handlePointerDown,
    handleWheel,
    handleCardTap,
  };
}
