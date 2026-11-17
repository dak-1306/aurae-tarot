import { cn } from "@/utils/cn";

type ChipVariant = "pill" | "card";

interface ChipButtonProps {
  readonly active?: boolean;
  readonly variant?: ChipVariant;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
  readonly children: React.ReactNode;
}

export function ChipButton({
  active = false,
  variant = "pill",
  disabled = false,
  onClick,
  children,
}: ChipButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "ui-chip",
        variant === "pill" ? "ui-chip-pill" : "ui-chip-card",
        active && "ui-chip-active",
      )}
    >
      {children}
    </button>
  );
}
