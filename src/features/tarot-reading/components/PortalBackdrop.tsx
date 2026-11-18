import { cn } from "@/utils/cn";

interface PortalBackdropProps {
  readonly variant?: "intention" | "altar";
  readonly className?: string;
}

/**
 * Nền kiến trúc Cánh Cổng Ngưỡng Cửa (Responsive Sanctuary Portal):
 * - Tách riêng tỷ lệ khung dọc Mobile (430x900) và khung ngang PC (1600x900)
 *   để trọn vẹn đôi trụ cột, vòm nhọn và bậc thềm luôn vừa vặn ở mọi kích thước màn hình.
 * - Tối ưu hiệu ứng GPU (transform & opacity) cho hoa thị đỉnh vòm và ánh sáng nội vi.
 */
export function PortalBackdrop({
  variant = "intention",
  className,
}: PortalBackdropProps) {
  const opacityClass = variant === "altar" ? "opacity-30" : "opacity-25";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {/* Lớp ánh sáng nền thở nhịp nhàng */}
      <div className="absolute inset-0 portal-stage-bg portal-glow-layer" />

      {/* 1. KIẾN TRÚC CỔNG CHO MOBILE (< md): Tỷ lệ dọc vừa khít khung điện thoại */}
      <svg
        viewBox="0 0 430 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className={cn(
          "h-full w-full md:hidden transition-opacity duration-500",
          opacityClass,
        )}
      >
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
          {/* Đầu cột ngoài */}
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
          <polygon points="28,326 32,330 28,334 24,330" fill="currentColor" />
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
          {/* Đầu cột trong & viên đá đỉnh vòm */}
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
      </svg>

      {/* 2. KIẾN TRÚC CỔNG CHO PC / TABLET (>= md): Tỷ lệ 16:9 ôm trọn không gian */}
      <svg
        viewBox="0 0 1600 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className={cn(
          "hidden md:block h-full w-full transition-opacity duration-500",
          opacityClass,
        )}
      >
        {/* Lớp vòm ngoài cùng (Ôm trọn Mascot & Form) */}
        <g className="ink-accent">
          <path
            d="M 240 830 L 240 390 C 240 212, 495 104, 800 52 C 1105 104, 1360 212, 1360 390 L 1360 830"
            stroke="currentColor"
            strokeWidth="0.95"
          />
          <path
            d="M 252 830 L 252 392 C 252 221, 502 116, 800 65 C 1098 116, 1348 221, 1348 392 L 1348 830"
            stroke="currentColor"
            strokeWidth="0.55"
            opacity="0.68"
          />
          {/* Đầu cột ngoài */}
          <line
            x1="230"
            y1="390"
            x2="262"
            y2="390"
            stroke="currentColor"
            strokeWidth="0.95"
          />
          <line
            x1="1338"
            y1="390"
            x2="1370"
            y2="390"
            stroke="currentColor"
            strokeWidth="0.95"
          />
          <polygon
            points="240,386 244,390 240,394 236,390"
            fill="currentColor"
          />
          <polygon
            points="1360,386 1364,390 1360,394 1356,390"
            fill="currentColor"
          />
        </g>

        {/* Lớp vòm giữa & Hoa thị xoay chậm */}
        <g className="ink-gold">
          <path
            d="M 490 830 L 490 420 C 490 276, 622 186, 800 148 C 978 186, 1110 276, 1110 420 L 1110 830"
            stroke="currentColor"
            strokeWidth="0.85"
            opacity="0.85"
          />
          <path
            d="M 500 830 L 500 422 C 500 283, 628 195, 800 158 C 972 195, 1100 283, 1100 422 L 1100 830"
            stroke="currentColor"
            strokeWidth="0.55"
            strokeDasharray="3 6"
            opacity="0.72"
          />
          <line
            x1="482"
            y1="420"
            x2="508"
            y2="420"
            stroke="currentColor"
            strokeWidth="0.85"
          />
          <line
            x1="1092"
            y1="420"
            x2="1118"
            y2="420"
            stroke="currentColor"
            strokeWidth="0.85"
          />

          {/* Hoa thị thiên văn (Rose Oculus) */}
          <g className="portal-oculus-pc">
            <circle
              cx="800"
              cy="104"
              r="24"
              stroke="currentColor"
              strokeWidth="0.8"
              opacity="0.85"
            />
            <circle
              cx="800"
              cy="104"
              r="15"
              stroke="currentColor"
              strokeWidth="0.6"
              strokeDasharray="2 4"
              opacity="0.75"
            />
            <line
              x1="800"
              y1="80"
              x2="800"
              y2="128"
              stroke="currentColor"
              strokeWidth="0.45"
              opacity="0.5"
            />
            <line
              x1="776"
              y1="104"
              x2="824"
              y2="104"
              stroke="currentColor"
              strokeWidth="0.45"
              opacity="0.5"
            />
          </g>

          <path
            d="M 800 93 L 802.2 101.8 L 811 104 L 802.2 106.2 L 800 115 L 797.8 106.2 L 789 104 L 797.8 101.8 Z"
            fill="currentColor"
            className="portal-star-glint"
          />
        </g>

        {/* Lớp vòm ngưỡng cửa trong cùng */}
        <g className="ink-accent portal-arch-shimmer">
          <path
            d="M 580 830 L 580 446 C 580 322, 676 242, 800 204 C 924 242, 1020 322, 1020 446 L 1020 830"
            stroke="currentColor"
            strokeWidth="0.95"
          />
          <path
            d="M 589 830 L 589 448 C 589 328, 682 250, 800 213 C 918 250, 1011 328, 1011 448 L 1011 830"
            stroke="currentColor"
            strokeWidth="0.55"
            opacity="0.65"
          />
          <line
            x1="572"
            y1="446"
            x2="596"
            y2="446"
            stroke="currentColor"
            strokeWidth="0.9"
          />
          <line
            x1="1004"
            y1="446"
            x2="1028"
            y2="446"
            stroke="currentColor"
            strokeWidth="0.9"
          />
          <polygon
            points="580,442 584,446 580,450 576,446"
            fill="currentColor"
          />
          <polygon
            points="1020,442 1024,446 1020,450 1016,446"
            fill="currentColor"
          />
          <polygon
            points="800,195 805,204 800,213 795,204"
            stroke="currentColor"
            strokeWidth="0.75"
            fill="none"
          />
        </g>

        {/* Bậc thềm cổng PC */}
        <g className="ink-gold" opacity="0.75">
          <line
            x1="160"
            y1="830"
            x2="1440"
            y2="830"
            stroke="currentColor"
            strokeWidth="0.9"
          />
          <line
            x1="100"
            y1="846"
            x2="1500"
            y2="846"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeDasharray="4 6"
          />
          <line
            x1="240"
            y1="830"
            x2="195"
            y2="878"
            stroke="currentColor"
            strokeWidth="0.65"
          />
          <line
            x1="1360"
            y1="830"
            x2="1405"
            y2="878"
            stroke="currentColor"
            strokeWidth="0.65"
          />
          <line
            x1="580"
            y1="830"
            x2="556"
            y2="878"
            stroke="currentColor"
            strokeWidth="0.65"
          />
          <line
            x1="1020"
            y1="830"
            x2="1044"
            y2="878"
            stroke="currentColor"
            strokeWidth="0.65"
          />
        </g>
      </svg>
    </div>
  );
}
