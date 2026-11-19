import { useCallback, useRef } from "react";

export function usePointerRipple<T extends HTMLElement>() {
  const hostRef = useRef<T | null>(null);
  const groupRef = useRef<HTMLSpanElement | null>(null);

  const handlePointerEnter = useCallback((event: React.PointerEvent<T>) => {
    if (event.pointerType !== "mouse") return;

    const host = hostRef.current;
    const group = groupRef.current;
    if (!host || !group) return;

    const rect = host.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const maxDistX = Math.max(x, rect.width - x);
    const maxDistY = Math.max(y, rect.height - y);
    const diameter = Math.ceil(Math.hypot(maxDistX, maxDistY) * 2);

    // 1. Đưa cả 3 đợt sóng về điểm khởi phát (scale 0)
    group.dataset.state = "reset";
    group.style.setProperty("--ripple-x", `${x}px`);
    group.style.setProperty("--ripple-y", `${y}px`);
    group.style.setProperty("--ripple-size", `${diameter}px`);

    // 2. Chốt khung hình khởi điểm rồi kích hoạt chuỗi sóng lan truyền
    void group.offsetWidth;
    group.dataset.state = "hover";
  }, []);

  const handlePointerLeave = useCallback(() => {
    const group = groupRef.current;
    if (!group) return;
    if (group.dataset.state === "hover") {
      group.dataset.state = "leave";
    }
  }, []);

  return {
    hostRef,
    groupRef,
    handlePointerEnter,
    handlePointerLeave,
  };
}
