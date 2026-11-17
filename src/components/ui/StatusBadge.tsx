import { cn } from "@/utils/cn";

type BadgeVariant = "accent" | "gold" | "neutral";

interface StatusBadgeProps {
  readonly variant?: BadgeVariant;
  readonly icon?: React.ReactNode;
  readonly children: React.ReactNode;
}

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  accent: "ui-badge-accent",
  gold: "ui-badge-gold",
  neutral: "ui-badge-neutral",
};

export function StatusBadge({
  variant = "accent",
  icon,
  children,
}: StatusBadgeProps) {
  return (
    <span className={cn("ui-badge", BADGE_CLASSES[variant])}>
      {icon}
      <span>{children}</span>
    </span>
  );
}
