"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { usePointerRipple } from "@/hooks/usePointerRipple";
import { cn } from "@/utils/cn";

export type ButtonVariant =
  | "primary"
  | "gold"
  | "outline"
  | "subtle"
  | "ghost"
  | "icon"
  | "danger"
  | "danger-icon";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly fullWidth?: boolean;
  readonly isLoading?: boolean;
  readonly icon?: ReactNode;
}

const VARIANT_CLASS_MAP: Record<ButtonVariant, string> = {
  primary: "ui-btn-plaque ui-btn-primary",
  gold: "ui-btn-plaque ui-btn-gold",
  outline: "ui-btn-pill ui-btn-outline",
  subtle: "ui-btn-pill ui-btn-subtle",
  ghost: "ui-btn-ghost",
  icon: "ui-btn-medallion",
  danger: "ui-btn-danger-icon",
  "danger-icon": "ui-btn-danger-icon",
};

const SIZE_CLASS_MAP: Record<ButtonSize, string> = {
  sm: "ui-btn-sm",
  md: "ui-btn-md",
  lg: "ui-btn-lg",
  icon: "",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  icon,
  children,
  className,
  disabled,
  onPointerEnter,
  onPointerLeave,
  ...rest
}: ButtonProps) {
  const { hostRef, groupRef, handlePointerEnter, handlePointerLeave } =
    usePointerRipple<HTMLButtonElement>();

  const isDisabled = Boolean(disabled || isLoading);

  return (
    <button
      ref={hostRef}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      onPointerEnter={(e) => {
        if (!isDisabled) handlePointerEnter(e);
        onPointerEnter?.(e);
      }}
      onPointerLeave={(e) => {
        handlePointerLeave();
        onPointerLeave?.(e);
      }}
      className={cn(
        "ui-btn",
        VARIANT_CLASS_MAP[variant],
        SIZE_CLASS_MAP[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {/* 3 đợt sóng đồng tâm lan truyền trên mặt nước */}
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

      <span className="ui-btn-content">
        {isLoading ? <span className="ui-spinner" aria-hidden="true" /> : icon}
        {children}
      </span>
    </button>
  );
}
