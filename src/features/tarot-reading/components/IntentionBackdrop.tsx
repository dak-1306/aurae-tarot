export function IntentionBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden intention-stage-bg"
    >
      <svg
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full ink-accent opacity-20"
      >
        {/* Hệ vòng quỹ đạo thiên văn đồng tâm chính giữa */}
        <circle
          cx="720"
          cy="450"
          r="260"
          stroke="currentColor"
          strokeWidth="0.65"
        />
        <circle
          cx="720"
          cy="450"
          r="390"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeDasharray="3 8"
        />
        <circle
          cx="720"
          cy="450"
          r="530"
          stroke="currentColor"
          strokeWidth="0.55"
        />
        <circle
          cx="720"
          cy="450"
          r="670"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2 12"
        />

        {/* Trục giao điểm chiêm tinh mảnh */}
        <line
          x1="720"
          y1="40"
          x2="720"
          y2="860"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2 10"
        />
        <line
          x1="120"
          y1="450"
          x2="1320"
          y2="450"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2 10"
        />

        {/* Các điểm sao đối xứng */}
        <circle cx="290" cy="210" r="1.8" fill="currentColor" />
        <circle cx="1150" cy="210" r="1.8" fill="currentColor" />
        <circle cx="290" cy="690" r="1.8" fill="currentColor" />
        <circle cx="1150" cy="690" r="1.8" fill="currentColor" />
      </svg>
    </div>
  );
}
