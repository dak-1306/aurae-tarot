export function CelestialBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <svg
        viewBox="0 0 900 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full max-w-5xl ink-accent opacity-25"
      >
        <circle
          cx="450"
          cy="260"
          r="175"
          stroke="currentColor"
          strokeWidth="0.9"
        />
        <circle
          cx="450"
          cy="260"
          r="245"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeDasharray="4 6"
        />
        <circle
          cx="450"
          cy="260"
          r="320"
          stroke="currentColor"
          strokeWidth="0.65"
        />

        <line
          x1="120"
          y1="210"
          x2="265"
          y2="270"
          stroke="currentColor"
          strokeWidth="0.7"
        />
        <line
          x1="265"
          y1="270"
          x2="365"
          y2="335"
          stroke="currentColor"
          strokeWidth="0.7"
        />
        <line
          x1="780"
          y1="210"
          x2="635"
          y2="270"
          stroke="currentColor"
          strokeWidth="0.7"
        />
        <line
          x1="635"
          y1="270"
          x2="535"
          y2="335"
          stroke="currentColor"
          strokeWidth="0.7"
        />

        <path
          d="M120 198 L123 207 L132 210 L123 213 L120 222 L117 213 L108 210 L117 207 Z"
          fill="currentColor"
        />
        <path
          d="M780 198 L783 207 L792 210 L783 213 L780 222 L777 213 L768 210 L777 207 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
