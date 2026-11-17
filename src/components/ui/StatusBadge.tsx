import { cn } from "@/utils/cn";

type BadgeVariant = "accent" | "gold" | "neutral";
type BadgeShape = "pill" | "plaque";

interface StatusBadgeProps {
  readonly variant?: BadgeVariant;
  readonly shape?: BadgeShape;
  readonly icon?: React.ReactNode;
  readonly children: React.ReactNode;
}

const BADGE_VARIANT_CLASSES: Record<BadgeVariant, string> = {
  accent: "ui-badge-accent",
  gold: "ui-badge-gold",
  neutral: "ui-badge-neutral",
};

export function StatusBadge({
  variant = "accent",
  shape = "pill",
  icon,
  children,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "ui-badge",
        shape === "plaque" ? "ui-badge-plaque" : "ui-badge-pill",
        BADGE_VARIANT_CLASSES[variant],
      )}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}
