import { cn } from '@/utils/cn';

interface OracleMascotProps {
  readonly variant?: 'hero' | 'emblem';
  readonly className?: string;
}

/**
 * Biểu tượng Thiên Thần Váy Dài (aurae Oracle Angel Line-Art):
 * - variant="emblem": Phiên bản tinh gọn cho Header & lá bài đang xào.
 * - variant="hero": Phiên bản cỡ lớn với đôi cánh rộng tinh tế, mái tóc dài,
 *   váy dài xếp ly thanh thoát và hiệu ứng bay lơ lửng nhịp nhàng.
 */
export function OracleMascot({
  variant = 'hero',
  className,
}: OracleMascotProps) {
  if (variant === 'emblem') {
    return (
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={cn('h-5 w-5 ink-accent', className)}
      >
        {/* Vòng hào quang mảnh */}
        <ellipse
          cx="120"
          cy="30"
          rx="16"
          ry="4"
          stroke="currentColor"
          strokeWidth="6.5"
        />

        {/* Đầu & Mái tóc dài buông qua vai */}
        <circle cx="120" cy="54" r="15" stroke="currentColor" strokeWidth="7.5" />
        <path
          d="M120 39 C106 40, 100 50, 100 66 C100 88, 96 112, 98 136"
          stroke="currentColor"
          strokeWidth="6.5"
          strokeLinecap="round"
        />
        <path
          d="M120 39 C134 40, 140 50, 140 66 C140 88, 144 112, 142 136"
          stroke="currentColor"
          strokeWidth="6.5"
          strokeLinecap="round"
        />

        {/* Đôi cánh lớn vươn rộng tinh gọn */}
        <path
          d="M106 74 C76 58, 44 38, 22 26 C26 56, 32 82, 40 104 C66 98, 88 90, 104 84"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M134 74 C164 58, 196 38, 218 26 C214 56, 208 82, 200 104 C174 98, 152 90, 136 84"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Thân trên thẳng nét & Tay chắp góc nhọn */}
        <path
          d="M108 75 L103 94 L120 85 L137 94 L132 75"
          stroke="currentColor"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M111 76 L113 110 L127 110 L129 76"
          stroke="currentColor"
          strokeWidth="6.5"
          strokeLinejoin="round"
        />

        {/* Váy dài xòe nhẹ */}
        <path
          d="M113 110 L127 110 L156 208 Q138 215 120 209 Q102 215 84 208 Z"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        <path
          d="M120 112 L120 209"
          stroke="currentColor"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center select-none',
        className
      )}
    >
      {/* Quầng sáng nền thở nhịp nhàng */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-4 rounded-full mascot-aura-ring blur-2xl"
      />

      <svg
        viewBox="0 0 360 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="relative z-10 h-full w-full"
      >
        {/* 1. HỆ VÒNG THIÊN VĂN ASTROLABE */}
        <circle
          cx="180"
          cy="180"
          r="164"
          className="ink-accent opacity-20"
          stroke="currentColor"
          strokeWidth="0.7"
        />

        <g className="mascot-ring-cw ink-gold opacity-40">
          <circle
            cx="180"
            cy="180"
            r="150"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeDasharray="2 7"
          />
          <line x1="180" y1="25" x2="180" y2="35" stroke="currentColor" strokeWidth="1" />
          <line x1="180" y1="325" x2="180" y2="335" stroke="currentColor" strokeWidth="1" />
          <line x1="25" y1="180" x2="35" y2="180" stroke="currentColor" strokeWidth="1" />
          <line x1="325" y1="180" x2="335" y2="180" stroke="currentColor" strokeWidth="1" />
        </g>

        <g className="mascot-ring-ccw ink-accent opacity-25">
          <circle
            cx="180"
            cy="180"
            r="132"
            stroke="currentColor"
            strokeWidth="0.65"
            strokeDasharray="16 6 2 6"
          />
        </g>

        {/* 2. ĐIỂM SAO SÁNG NHỊP NHÀNG */}
        <path
          d="M180 34 L182 41.5 L189.5 43.5 L182 45.5 L180 53 L178 45.5 L170.5 43.5 L178 41.5 Z"
          className="mascot-star-pulse ink-gold"
          fill="currentColor"
        />
        <circle
          cx="96"
          cy="82"
          r="1.6"
          className="mascot-star-pulse ink-accent"
          fill="currentColor"
        />
        <circle
          cx="264"
          cy="82"
          r="1.6"
          className="mascot-star-pulse ink-accent"
          fill="currentColor"
        />

        {/* 3. THIÊN THẦN VÁY DÀI BAY LƠ LỬNG */}
        <g className="mascot-float-group ink-gold">
          {/* Vòng hào quang mảnh trên đỉnh đầu */}
          <g className="mascot-halo-group">
            <ellipse
              cx="180"
              cy="64"
              rx="18"
              ry="4.2"
              stroke="currentColor"
              strokeWidth="1.45"
            />
          </g>

          {/* ĐÔI CÁNH LỚN VƯƠN RỘNG, TINH TẾ & CHÍNH XÁC */}
          {/* Cánh Trái */}
          <g className="mascot-wing-left">
            {/* Cung cánh chính vươn cao & rộng */}
            <path
              d="M165 113 C128 92, 78 60, 34 42 C38 82, 44 118, 54 148 C90 141, 126 132, 157 125"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Tầng lông vũ phụ uốn lượn mềm bên dưới */}
            <path
              d="M66 146 C71 162, 76 173, 84 182 C112 169, 136 152, 156 134"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* 2 đường sống lông vũ thanh mảnh */}
            <path
              d="M160 118 C122 102, 84 82, 48 64"
              stroke="currentColor"
              strokeWidth="1.05"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M158 122 C124 115, 92 105, 62 94"
              stroke="currentColor"
              strokeWidth="1.05"
              strokeLinecap="round"
              opacity="0.7"
            />
          </g>

          {/* Cánh Phải (Đối xứng tuyệt đối qua trục x = 180) */}
          <g className="mascot-wing-right">
            <path
              d="M195 113 C232 92, 282 60, 326 42 C322 82, 316 118, 306 148 C270 141, 234 132, 203 125"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M294 146 C289 162, 284 173, 276 182 C248 169, 224 152, 204 134"
              stroke="currentColor"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M200 118 C238 102, 276 82, 312 64"
              stroke="currentColor"
              strokeWidth="1.05"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M202 122 C236 115, 268 105, 298 94"
              stroke="currentColor"
              strokeWidth="1.05"
              strokeLinecap="round"
              opacity="0.7"
            />
          </g>

          {/* ĐẦU & MÁI TÓC DÀI THƯỚT THA BUÔNG XUỐNG QUA EO */}
          <circle
            cx="180"
            cy="88"
            r="15"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Đường rẽ ngôi tóc thanh thoát */}
          <path
            d="M180 73.5 Q171 80 165.5 89 M180 73.5 Q189 80 194.5 89"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
          {/* Lọn tóc dài bên trái rủ xuống ngang hông */}
          <path
            d="M180 73 C165 73, 158 84, 158 98 C158 128, 150 164, 153 206"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M165.5 89 C164 116, 159 154, 161 196"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.78"
          />
          {/* Lọn tóc dài bên phải rủ xuống ngang hông */}
          <path
            d="M180 73 C195 73, 202 84, 202 98 C202 128, 210 164, 207 206"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M194.5 89 C196 116, 201 154, 199 196"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.78"
          />

          {/* THÂN TRÊN THON GỌN, CỔ ÁO CHỮ V & ĐÔI TAY CHẮP THANH THOÁT */}
          {/* Cổ áo chữ V */}
          <path
            d="M171 111 L180 120 L189 111"
            stroke="currentColor"
            strokeWidth="1.45"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Đường thân áo thẳng nét từ vai xuống eo */}
          <path
            d="M167 113 L171 160 M193 113 L189 160"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinecap="round"
          />

          {/* Đôi tay chắp góc nhọn hướng lên giữa ngực (không tạo nét tròn ở ngực) */}
          <path
            d="M167 113 L161 137 L180 127"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M193 113 L199 137 L180 127"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Nét bàn tay chắp thẳng đứng */}
          <path
            d="M180 124 L180 140"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Tay áo rủ dọc hai bên eo */}
          <path
            d="M161 137 L158 162 L169.5 151 M199 137 L202 162 L190.5 151"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Đai lưng eo */}
          <path
            d="M170.5 160 Q180 163 189.5 160 M170 164 Q180 167 190 164"
            stroke="currentColor"
            strokeWidth="1.45"
            strokeLinecap="round"
          />

          {/* CHIẾC VÁY DÀI XẾP LY RỦ THƯỚT THA */}
          <path
            d="M170 164 C156 202, 138 248, 124 292"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M190 164 C204 202, 222 248, 236 292"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Chân váy gợn sóng mềm mại */}
          <path
            d="M124 292 Q138 298, 152 292 Q166 299, 180 293 Q194 299, 208 292 Q222 298, 236 292"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M127 286 Q140 291, 153 286 Q166 292, 180 287 Q194 292, 207 286 Q220 291, 233 286"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* 3 đường ly váy rủ thanh thoát */}
          <path
            d="M173 166 C163 206, 154 250, 148 293"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.78"
          />
          <path
            d="M180 167 L180 293"
            stroke="currentColor"
            strokeWidth="1.05"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="M187 166 C197 206, 206 250, 212 293"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.78"
          />

          {/* Điểm sáng ngọc bích tại đầu ngón tay chắp */}
          <circle
            cx="180"
            cy="121"
            r="2"
            className="ink-accent"
            fill="currentColor"
          />
        </g>
      </svg>
    </div>
  );
}