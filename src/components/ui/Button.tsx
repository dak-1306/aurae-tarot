import { cn } from "@/utils/cn";

type ButtonVariant =
  | "primary"
  | "gold"
  | "outline"
  | "subtle"
  | "ghost"
  | "icon"
  | "danger-icon";

type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly fullWidth?: boolean;
  readonly hideLabelOnMobile?: boolean;
  readonly isLoading?: boolean;
  readonly icon?: React.ReactNode;
  readonly children?: React.ReactNode;
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly disabled?: boolean;
  readonly type?: "button" | "submit" | "reset";
  readonly "aria-label"?: string;
  readonly "aria-expanded"?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "ui-btn-plaque ui-btn-primary",
  gold: "ui-btn-plaque ui-btn-gold",
  outline: "ui-btn-pill ui-btn-outline",
  subtle: "ui-btn-pill ui-btn-subtle",
  ghost: "ui-btn-ghost",
  icon: "ui-btn-medallion",
  "danger-icon": "ui-btn-danger-icon",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "ui-btn-sm",
  md: "ui-btn-md",
  lg: "ui-btn-lg",
  icon: "",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  hideLabelOnMobile = false,
  isLoading = false,
  icon,
  children,
  onClick,
  disabled,
  type = "button",
  "aria-label": ariaLabel,
  "aria-expanded": ariaExpanded,
}: ButtonProps) {
  const isIconOnly =
    variant === "icon" || variant === "danger-icon" || size === "icon";

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      aria-expanded={ariaExpanded}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "ui-btn",
        VARIANT_CLASSES[variant],
        !isIconOnly && SIZE_CLASSES[size],
        hideLabelOnMobile && "w-11 px-0 sm:w-auto sm:px-3.5",
        fullWidth && "w-full",
      )}
    >
      {isLoading ? <span className="ui-spinner" aria-hidden="true" /> : icon}
      {children && (
        <span className={cn(hideLabelOnMobile && "hidden sm:inline")}>
          {children}
        </span>
      )}
    </button>
  );
}
