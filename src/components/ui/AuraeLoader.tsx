import { cn } from "@/utils/cn";

interface AuraeLoaderProps {
  readonly variant?: "inline" | "block" | "fullscreen";
  readonly size?: "sm" | "md" | "lg";
  readonly label?: string;
  readonly className?: string;
}

const ICON_SIZE_MAP = {
  sm: "h-5 w-5",
  md: "h-9 w-9",
  lg: "h-12 w-12",
} as const;

function AstrolabeSpinnerMark({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      {/* Vòng quỹ đạo ngoài nét mảnh */}
      <g className="aurae-loader-ring-outer ink-accent">
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="18 6 4 6"
          opacity="0.85"
        />
        <circle cx="24" cy="4" r="1.5" fill="currentColor" />
      </g>

      {/* Vòng quỹ đạo trong vàng kim */}
      <g className="aurae-loader-ring-inner ink-gold">
        <circle
          cx="24"
          cy="24"
          r="13.5"
          stroke="currentColor"
          strokeWidth="0.95"
          strokeDasharray="10 5"
          opacity="0.9"
        />
        <circle cx="24" cy="37.5" r="1.3" fill="currentColor" />
      </g>

      {/* Ngôi sao 4 cánh nhịp thở ở tâm */}
      <path
        d="M 24 15.5 L 25.8 22.2 L 32.5 24 L 25.8 25.8 L 24 32.5 L 22.2 25.8 L 15.5 24 L 22.2 22.2 Z"
        fill="currentColor"
        className="aurae-loader-core-star ink-accent"
      />
    </svg>
  );
}

/**
 * Hiệu ứng Loading thống nhất toàn hệ thống aurae:
 * - inline: Dùng khi đang stream từng dòng chữ hoặc bên trong nút bấm.
 * - block: Dùng khi đang chờ AI phản hồi đoạn mở đầu (Tổng quan / Hỏi sâu).
 * - fullscreen: Dùng khi khởi tạo ứng dụng hoặc tải dữ liệu toàn trang.
 */
export function AuraeLoader({
  variant = "block",
  size,
  label,
  className,
}: AuraeLoaderProps) {
  const resolvedSize =
    size ??
    (variant === "inline" ? "sm" : variant === "fullscreen" ? "lg" : "md");

  if (variant === "inline") {
    return (
      <span
        role="status"
        aria-live="polite"
        className={cn("inline-flex items-center gap-2 select-none", className)}
      >
        <AstrolabeSpinnerMark className={ICON_SIZE_MAP[resolvedSize]} />
        {label && (
          <span className="text-xs font-medium tracking-wide ink-secondary aurae-loader-caption">
            {label}
          </span>
        )}
      </span>
    );
  }

  if (variant === "fullscreen") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "flex min-h-[60vh] w-full flex-col items-center justify-center gap-3.5 px-6 text-center select-none",
          className,
        )}
      >
        <AstrolabeSpinnerMark className={ICON_SIZE_MAP[resolvedSize]} />
        <p className="font-serif text-sm tracking-wide ink-secondary aurae-loader-caption">
          {label ?? "Đang chuẩn bị không gian chiêm nghiệm..."}
        </p>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 py-8 px-4 text-center select-none",
        className,
      )}
    >
      <AstrolabeSpinnerMark className={ICON_SIZE_MAP[resolvedSize]} />
      {label && (
        <p className="font-serif text-xs sm:text-sm tracking-wide ink-secondary aurae-loader-caption">
          {label}
        </p>
      )}
    </div>
  );
}
