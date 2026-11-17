import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "outline" | "subtle" | "ghost" | "danger-icon";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly fullWidth?: boolean;
  readonly hideLabelOnMobile?: boolean;
  readonly icon?: React.ReactNode;
  readonly children?: React.ReactNode;
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly disabled?: boolean;
  readonly type?: "button" | "submit" | "reset";
  readonly "aria-label"?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "ui-btn-primary",
  outline: "ui-btn-outline",
  subtle: "ui-btn-subtle",
  ghost: "ui-btn-ghost",
  "danger-icon": "ui-btn-danger-icon",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "ui-btn-sm",
  md: "ui-btn-md",
  lg: "ui-btn-lg",
  icon: "ui-btn-icon",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  hideLabelOnMobile = false,
  icon,
  children,
  onClick,
  disabled,
  type = "button",
  "aria-label": ariaLabel,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "ui-btn",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        hideLabelOnMobile && "w-11 px-0 sm:w-auto sm:px-3.5",
        fullWidth && "w-full",
      )}
    >
      {icon}
      {children && (
        <span className={cn(hideLabelOnMobile && "hidden sm:inline")}>
          {children}
        </span>
      )}
    </button>
  );
}
