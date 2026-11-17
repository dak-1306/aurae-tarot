import { cn } from "@/utils/cn";

interface CardBackArtProps {
  readonly className?: string;
}

export function CardBackArt({ className }: CardBackArtProps) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-xl card-back-surface p-1.5",
        className,
      )}
    >
      <div className="relative flex h-full w-full items-center justify-center rounded-lg card-back-inner-frame">
        <svg
          viewBox="0 0 120 190"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full ink-accent-light opacity-75"
          aria-hidden="true"
        >
          <rect
            x="8"
            y="8"
            width="104"
            height="174"
            rx="6"
            stroke="currentColor"
            strokeWidth="0.7"
            strokeOpacity="0.45"
          />

          <circle
            cx="60"
            cy="95"
            r="38"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeOpacity="0.55"
          />
          <circle
            cx="60"
            cy="95"
            r="24"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeDasharray="2 2"
            strokeOpacity="0.5"
          />

          <polygon
            points="60,26 102,95 60,164 18,95"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeOpacity="0.65"
          />
          <polygon
            points="60,44 94,126 26,126"
            stroke="currentColor"
            strokeWidth="0.7"
            strokeOpacity="0.5"
          />
          <polygon
            points="60,146 94,64 26,64"
            stroke="currentColor"
            strokeWidth="0.7"
            strokeOpacity="0.5"
          />

          <line
            x1="60"
            y1="16"
            x2="60"
            y2="174"
            stroke="currentColor"
            strokeWidth="0.65"
            strokeOpacity="0.45"
          />
          <line
            x1="14"
            y1="95"
            x2="106"
            y2="95"
            stroke="currentColor"
            strokeWidth="0.65"
            strokeOpacity="0.45"
          />

          <circle cx="60" cy="95" r="3" fill="currentColor" />
          <circle cx="60" cy="26" r="1.8" fill="currentColor" />
          <circle cx="60" cy="164" r="1.8" fill="currentColor" />
          <circle cx="18" cy="95" r="1.8" fill="currentColor" />
          <circle cx="102" cy="95" r="1.8" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
