"use client";

import type { ButtonHTMLAttributes } from "react";
import { usePointerRipple } from "@/hooks/usePointerRipple";
import { cn } from "@/utils/cn";

interface ChipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "tag" | "card";
  readonly active?: boolean;
}

export function ChipButton({
  variant = "tag",
  active = false,
  children,
  className,
  disabled,
  onPointerEnter,
  onPointerLeave,
  ...rest
}: ChipButtonProps) {
  const { hostRef, groupRef, handlePointerEnter, handlePointerLeave } =
    usePointerRipple<HTMLButtonElement>();

  return (
    <button
      ref={hostRef}
      type="button"
      disabled={disabled}
      data-active={active ? "true" : "false"}
      onPointerEnter={(e) => {
        if (!disabled) handlePointerEnter(e);
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        handlePointerLeave();
        onPointerLeave?.(e);
      }}
      className={cn(
        "ui-chip",
        variant === "card" ? "ui-chip-card" : "ui-chip-tag",
        className,
      )}
      {...rest}
    >
      <span
        ref={groupRef}
        aria-hidden="true"
        data-state="idle"
        className="ui-ripple-group"
      >
        <span className="ui-ripple-wave ui-ripple-wave-1" />
        <span className="ui-ripple-wave ui-ripple-wave-2" />
        <span className="ui-ripple-wave ui-ripple-wave-3" />
      </span>
      <span className="relative z-10">{children}</span>
    </button>
  );
}
