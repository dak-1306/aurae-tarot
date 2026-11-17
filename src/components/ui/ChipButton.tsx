import { cn } from "@/utils/cn";

type ChipVariant = "tag" | "card";

interface ChipButtonProps {
  readonly active?: boolean;
  readonly variant?: ChipVariant;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
  readonly children: React.ReactNode;
}

export function ChipButton({
  active = false,
  variant = "tag",
  disabled = false,
  onClick,
  children,
}: ChipButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      data-active={active}
      onClick={onClick}
      className={cn(
        "ui-chip",
        variant === "tag" ? "ui-chip-tag" : "ui-chip-card",
      )}
    >
      {children}
    </button>
  );
}
