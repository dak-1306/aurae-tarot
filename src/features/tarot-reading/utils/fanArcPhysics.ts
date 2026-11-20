export interface ArcGeometry {
  readonly radius: number;
  readonly pivotTop: number;
  readonly spacingAngle: number;
  readonly visibleRange: number;
  readonly centerLift: number;
}

export interface GapClosureState {
  readonly splitIndex: number;
  startTime: number | null;
  readonly duration: number;
}

export interface SlotVisualState {
  readonly visible: boolean;
  readonly zIndex: number;
  readonly transform: string;
}

export const FAN_PHYSICS = {
  DRAG_PIXELS_PER_CARD: 52,
  WHEEL_DIVISOR: 380,
  MAX_WHEEL_VELOCITY: 1.4,
  FRICTION_PER_FRAME: 0.935,
  STOP_VELOCITY_THRESHOLD: 0.0008,
  SNAP_SPEED: 0.16,
  SNAP_EPSILON: 0.0015,
  WHEEL_SETTLE_DELAY_MS: 130,
  HOLD_CANCEL_INERTIA_MS: 90,
  TAP_MAX_DRAG_PX: 8,
  GAP_CLOSURE_DURATION_MS: 260,
} as const;

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function getArcGeometry(
  isDesktop: boolean,
  compact: boolean,
  cardCount: number,
): ArcGeometry {
  if (isDesktop) {
    return {
      radius: 820,
      pivotTop: compact ? 945 : 980,
      spacingAngle: compact ? 5.2 : 3.6,
      visibleRange: Math.min(compact ? 9 : 16, cardCount / 2),
      centerLift: compact ? 10 : 14,
    };
  }

  return {
    radius: 320,
    pivotTop: 435,
    spacingAngle: 11.2,
    visibleRange: Math.min(4.4, cardCount / 2),
    centerLift: 10,
  };
}

export function computeArcSlotVisual(
  idx: number,
  count: number,
  currentPos: number,
  geometry: ArcGeometry,
  gapSpread: number,
  splitIndex: number,
): SlotVisualState {
  let diff = idx - currentPos;
  diff = diff - Math.round(diff / count) * count;

  if (gapSpread > 0) {
    diff += idx < splitIndex ? -gapSpread : gapSpread;
  }

  if (Math.abs(diff) > geometry.visibleRange + 0.6) {
    return { visible: false, zIndex: 0, transform: "" };
  }

  const relAngle = diff * geometry.spacingAngle;
  const centerFocus = Math.max(0, 1 - Math.abs(diff) / 1.35);
  const lift = centerFocus * geometry.centerLift;
  const scale = 1 + centerFocus * 0.035;
  const zIndex = Math.round((diff + geometry.visibleRange + 2) * 10);

  return {
    visible: true,
    zIndex,
    transform: `translate3d(0, 0, 0) rotate(${relAngle.toFixed(3)}deg) translateY(-${(geometry.radius + lift).toFixed(2)}px) scale(${scale.toFixed(4)})`,
  };
}
