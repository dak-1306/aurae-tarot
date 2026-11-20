import { useId } from "react";
import { cn } from "@/utils/cn";

interface PortalBackdropProps {
  readonly variant?: "intention" | "altar";
  readonly className?: string;
}

export function PortalBackdrop({
  variant = "intention",
  className,
}: PortalBackdropProps) {
  const uid = useId().replace(/:/g, "");

  const gradMobileId = `portal-sweep-grad-m-${uid}`;
  const maskMobileId = `portal-sweep-mask-m-${uid}`;
  const geoMobileId = `portal-geo-m-${uid}`;

  const gradPcId = `portal-sweep-grad-pc-${uid}`;
  const maskPcId = `portal-sweep-mask-pc-${uid}`;
  const geoPcId = `portal-geo-pc-${uid}`;

  const opacityClass = variant === "altar" ? "opacity-24" : "opacity-36";

  return (
    <div
      aria-hidden="true"
      data-variant={variant}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {/* Lớp ánh sáng nền thở nhịp nhàng */}
      <div className="absolute inset-0 portal-stage-bg portal-glow-layer" />

      {/* 1. KIẾN TRÚC CỔNG CHO MOBILE (< lg): Tỷ lệ dọc 430x900 */}
      <svg
        viewBox="0 0 430 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className={cn(
          "h-full w-full lg:hidden transition-opacity duration-500",
          opacityClass,
        )}
      >
        <defs>
          <linearGradient id={gradMobileId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="20%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>

          <mask
            id={maskMobileId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="430"
            height="900"
          >
            <rect
              x="0"
              y="0"
              width="430"
              height="1060"
              fill={`url(#${gradMobileId})`}
              className="portal-sweep-rect"
            />
          </mask>

          <g id={geoMobileId}>
            {/* Vòm cổng ngoài */}
            <g className="ink-accent">
              <path
                d="M 28 824 L 28 330 C 28 186, 110 100, 215 56 C 320 100, 402 186, 402 330 L 402 824"
                stroke="currentColor"
                strokeWidth="0.95"
              />
              <path
                d="M 36 824 L 36 332 C 36 193, 115 110, 215 67 C 315 110, 394 193, 394 332 L 394 824"
                stroke="currentColor"
                strokeWidth="0.55"
                opacity="0.65"
              />
              <line
                x1="20"
                y1="330"
                x2="44"
                y2="330"
                stroke="currentColor"
                strokeWidth="0.95"
              />
              <line
                x1="386"
                y1="330"
                x2="410"
                y2="330"
                stroke="currentColor"
                strokeWidth="0.95"
              />
              <polygon
                points="28,326 32,330 28,334 24,330"
                fill="currentColor"
              />
              <polygon
                points="402,326 406,330 402,334 398,330"
                fill="currentColor"
              />
            </g>

            {/* Hoa thị thiên văn xoay chậm giữa đỉnh vòm */}
            <g className="ink-gold">
              <g className="portal-oculus-mobile">
                <circle
                  cx="215"
                  cy="112"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  opacity="0.85"
                />
                <circle
                  cx="215"
                  cy="112"
                  r="12"
                  stroke="currentColor"
                  strokeWidth="0.6"
                  strokeDasharray="2 4"
                  opacity="0.75"
                />
                <line
                  x1="215"
                  y1="92"
                  x2="215"
                  y2="132"
                  stroke="currentColor"
                  strokeWidth="0.45"
                  opacity="0.5"
                />
                <line
                  x1="195"
                  y1="112"
                  x2="235"
                  y2="112"
                  stroke="currentColor"
                  strokeWidth="0.45"
                  opacity="0.5"
                />
              </g>

              <path
                d="M 215 102 L 217 110 L 225 112 L 217 114 L 215 122 L 213 114 L 205 112 L 213 110 Z"
                fill="currentColor"
                className="portal-star-glint"
              />
            </g>

            {/* Vòm ngưỡng cửa bên trong */}
            <g className="ink-accent portal-arch-shimmer">
              <path
                d="M 64 824 L 64 364 C 64 244, 130 184, 215 156 C 300 184, 366 244, 366 364 L 366 824"
                stroke="currentColor"
                strokeWidth="0.95"
              />
              <path
                d="M 71 824 L 71 366 C 71 251, 134 193, 215 166 C 296 193, 359 251, 359 366 L 359 824"
                stroke="currentColor"
                strokeWidth="0.55"
                strokeDasharray="3 6"
              />
              <line
                x1="57"
                y1="364"
                x2="77"
                y2="364"
                stroke="currentColor"
                strokeWidth="0.9"
              />
              <line
                x1="353"
                y1="364"
                x2="373"
                y2="364"
                stroke="currentColor"
                strokeWidth="0.9"
              />
              <polygon
                points="215,148 220,156 215,164 210,156"
                stroke="currentColor"
                strokeWidth="0.75"
                fill="none"
              />
            </g>

            {/* Bậc thềm cổng Mobile */}
            <g className="ink-gold" opacity="0.78">
              <line
                x1="12"
                y1="824"
                x2="418"
                y2="824"
                stroke="currentColor"
                strokeWidth="0.9"
              />
              <line
                x1="4"
                y1="838"
                x2="426"
                y2="838"
                stroke="currentColor"
                strokeWidth="0.6"
                strokeDasharray="3 5"
              />
              <line
                x1="28"
                y1="824"
                x2="14"
                y2="868"
                stroke="currentColor"
                strokeWidth="0.65"
              />
              <line
                x1="402"
                y1="824"
                x2="416"
                y2="868"
                stroke="currentColor"
                strokeWidth="0.65"
              />
              <line
                x1="64"
                y1="824"
                x2="54"
                y2="868"
                stroke="currentColor"
                strokeWidth="0.65"
              />
              <line
                x1="366"
                y1="824"
                x2="376"
                y2="868"
                stroke="currentColor"
                strokeWidth="0.65"
              />
            </g>
          </g>
        </defs>

        <use href={`#${geoMobileId}`} opacity="0.26" />
        <g mask={`url(#${maskMobileId})`}>
          <use href={`#${geoMobileId}`} />
        </g>
      </svg>

      {/* 2. KIẾN TRÚC CỔNG CHO PC (>= lg): Tỷ lệ cân đối 900x900 ôm trọn nửa trái */}
      <svg
        viewBox="0 0 900 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className={cn(
          "hidden lg:block h-full w-full transition-opacity duration-500",
          opacityClass,
        )}
      >
        <defs>
          <linearGradient id={gradPcId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="20%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>

          <mask
            id={maskPcId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="900"
            height="900"
          >
            <rect
              x="0"
              y="0"
              width="900"
              height="1060"
              fill={`url(#${gradPcId})`}
              className="portal-sweep-rect"
            />
          </mask>

          <g id={geoPcId}>
            {/* Lớp vòm ngoài cùng */}
            <g className="ink-accent">
              <path
                d="M 130 826 L 130 370 C 130 192, 275 104, 450 56 C 625 104, 770 192, 770 370 L 770 826"
                stroke="currentColor"
                strokeWidth="0.95"
              />
              <path
                d="M 140 826 L 140 372 C 140 201, 281 115, 450 68 C 619 115, 760 201, 760 372 L 760 826"
                stroke="currentColor"
                strokeWidth="0.55"
                opacity="0.68"
              />
              <line
                x1="120"
                y1="370"
                x2="148"
                y2="370"
                stroke="currentColor"
                strokeWidth="0.95"
              />
              <line
                x1="752"
                y1="370"
                x2="780"
                y2="370"
                stroke="currentColor"
                strokeWidth="0.95"
              />
              <polygon
                points="130,366 134,370 130,374 126,370"
                fill="currentColor"
              />
              <polygon
                points="770,366 774,370 770,374 766,370"
                fill="currentColor"
              />
            </g>

            {/* Lớp vòm giữa & Hoa thị xoay chậm */}
            <g className="ink-gold">
              <path
                d="M 225 826 L 225 408 C 225 266, 326 186, 450 152 C 574 186, 675 266, 675 408 L 675 826"
                stroke="currentColor"
                strokeWidth="0.85"
                opacity="0.85"
              />
              <path
                d="M 234 826 L 234 410 C 234 273, 332 195, 450 162 C 568 195, 666 273, 666 410 L 666 826"
                stroke="currentColor"
                strokeWidth="0.55"
                strokeDasharray="3 6"
                opacity="0.72"
              />
              <line
                x1="217"
                y1="408"
                x2="241"
                y2="408"
                stroke="currentColor"
                strokeWidth="0.85"
              />
              <line
                x1="659"
                y1="408"
                x2="683"
                y2="408"
                stroke="currentColor"
                strokeWidth="0.85"
              />

              {/* Hoa thị thiên văn (Rose Oculus) tâm (450, 108) */}
              <g className="portal-oculus-pc">
                <circle
                  cx="450"
                  cy="108"
                  r="22"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  opacity="0.85"
                />
                <circle
                  cx="450"
                  cy="108"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="0.6"
                  strokeDasharray="2 4"
                  opacity="0.75"
                />
                <line
                  x1="450"
                  y1="86"
                  x2="450"
                  y2="130"
                  stroke="currentColor"
                  strokeWidth="0.45"
                  opacity="0.5"
                />
                <line
                  x1="428"
                  y1="108"
                  x2="472"
                  y2="108"
                  stroke="currentColor"
                  strokeWidth="0.45"
                  opacity="0.5"
                />
              </g>

              <path
                d="M 450 97 L 452.2 105.8 L 461 108 L 452.2 110.2 L 450 119 L 447.8 110.2 L 439 108 L 447.8 105.8 Z"
                fill="currentColor"
                className="portal-star-glint"
              />
            </g>

            {/* Lớp vòm ngưỡng cửa trong cùng */}
            <g className="ink-accent portal-arch-shimmer">
              <path
                d="M 285 826 L 285 436 C 285 314, 360 238, 450 204 C 540 238, 615 314, 615 436 L 615 826"
                stroke="currentColor"
                strokeWidth="0.95"
              />
              <path
                d="M 293 826 L 293 438 C 293 320, 365 246, 450 213 C 535 246, 607 320, 607 438 L 607 826"
                stroke="currentColor"
                strokeWidth="0.55"
                opacity="0.65"
              />
              <line
                x1="277"
                y1="436"
                x2="299"
                y2="436"
                stroke="currentColor"
                strokeWidth="0.9"
              />
              <line
                x1="601"
                y1="436"
                x2="623"
                y2="436"
                stroke="currentColor"
                strokeWidth="0.9"
              />
              <polygon
                points="285,432 289,436 285,440 281,436"
                fill="currentColor"
              />
              <polygon
                points="615,432 619,436 615,440 611,436"
                fill="currentColor"
              />
              <polygon
                points="450,195 455,204 450,213 445,204"
                stroke="currentColor"
                strokeWidth="0.75"
                fill="none"
              />
            </g>

            {/* Bậc thềm cổng PC */}
            <g className="ink-gold" opacity="0.75">
              <line
                x1="82"
                y1="826"
                x2="818"
                y2="826"
                stroke="currentColor"
                strokeWidth="0.9"
              />
              <line
                x1="46"
                y1="842"
                x2="854"
                y2="842"
                stroke="currentColor"
                strokeWidth="0.6"
                strokeDasharray="4 6"
              />
              <line
                x1="130"
                y1="826"
                x2="96"
                y2="874"
                stroke="currentColor"
                strokeWidth="0.65"
              />
              <line
                x1="770"
                y1="826"
                x2="804"
                y2="874"
                stroke="currentColor"
                strokeWidth="0.65"
              />
              <line
                x1="285"
                y1="826"
                x2="266"
                y2="874"
                stroke="currentColor"
                strokeWidth="0.65"
              />
              <line
                x1="615"
                y1="826"
                x2="634"
                y2="874"
                stroke="currentColor"
                strokeWidth="0.65"
              />
            </g>
          </g>
        </defs>

        <use href={`#${geoPcId}`} opacity="0.26" />
        <g mask={`url(#${maskPcId})`}>
          <use href={`#${geoPcId}`} />
        </g>
      </svg>
    </div>
  );
}
