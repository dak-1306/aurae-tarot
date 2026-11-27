import type { TopicId, TopicPreset } from "@/types/tarot";

export const STORAGE_KEYS = {
  ACTIVE_SESSION: "aurae_active_session_v1",
  READING_HISTORY: "aurae_history_v1",
  PREFERENCES: "aurae_preferences_v1",
  SOUND_PREF: "aurae_sound_pref_v1",
  // Alias giữ lại để tương thích nếu file cũ còn gọi
  CURRENT_SESSION: "aurae_active_session_v1",
  HISTORY: "aurae_history_v1",
  THEME_MODE: "aurae_preferences_v1",
} as const;

export const TAROT_CONFIG = {
  INITIAL_DRAW_COUNT: 3,
  INITIAL_FAN_POOL_SIZE: 78,
  CLARIFIER_FAN_POOL_SIZE: 22,
  MAX_DEEP_DIVE_ROUNDS: 2,
  MAX_HISTORY_ITEMS: 30,
  BREATHING_DURATION_MS: 3200,
  BREATHING_SKIP_DELAY_MS: 1200,
  SHUFFLE_DURATION_MS: 1500,
  CARD_FLIP_DELAY_MS: 280,
  REVEAL_TO_SYNTHESIS_DELAY_MS: 850,
  REVERSED_PROBABILITY: 0.35,
  STREAM_CHUNK_DELAY_MS: 24,
  SHARE_IMAGE_WIDTH: 1080,
  SHARE_IMAGE_HEIGHT: 1920,
} as const;

export const AUDIO_CONFIG = {
  SRC: "/audio/ambient-ritual.mp3",
  TARGET_VOLUME: 0.28,
  FADE_IN_DURATION_MS: 1800,
  FADE_OUT_DURATION_MS: 850,
} as const;

export const TOPIC_PRESETS: Record<TopicId, TopicPreset> = {
  general: {
    id: "general",
    label: "Tổng quan",
    spreadPositions: ["Đã qua", "Hiện tại", "Sắp tới"],
    sampleQuestions: [
      "Điều gì đang đợi mình ở chặng đường tới?",
      "Lúc này mình cần lưu tâm điều gì nhất?",
      "Có tín hiệu nào mình đang vô tình bỏ lỡ không?",
    ],
    deepDiveSuggestions: [
      "Mình nên buông điều gì cho nhẹ lòng?",
      "Tuần này mình nên bắt đầu từ đâu?",
      "Có góc khuất nào mình chưa nhìn ra?",
    ],
  },
  love: {
    id: "love",
    label: "Tình cảm",
    spreadPositions: ["Bạn", "Người ấy", "Hai người"],
    sampleQuestions: [
      "Chuyện tình cảm của mình đang đi về đâu?",
      "Người ấy đang thật sự nghĩ gì về mình?",
      "Mình cần gỡ nút thắt nào để sẵn sàng yêu lại?",
    ],
    deepDiveSuggestions: [
      "Điều gì đang làm hai đứa xa nhau?",
      "Lúc này mình nên bước tới hay lùi lại?",
      "Chuyện này đang dạy mình điều gì?",
    ],
  },
  career: {
    id: "career",
    label: "Công việc",
    spreadPositions: ["Nền tảng", "Trở ngại", "Hướng mở"],
    sampleQuestions: [
      "Công việc sắp tới của mình có khởi sắc không?",
      "Mình có nên rẽ sang một hướng khác?",
      "Điểm tựa nào giúp mình vững vàng lúc này?",
    ],
    deepDiveSuggestions: [
      "Cần cẩn trọng điều gì trước khi quyết định?",
      "Mình nên tập trung cải thiện điều gì nhất?",
      "Đã đến lúc hành động chưa hay cần đợi thêm?",
    ],
  },
  finance: {
    id: "finance",
    label: "Tài chính",
    spreadPositions: ["Hiện tại", "Dòng tiền", "Lời khuyên"],
    sampleQuestions: [
      "Tài chính của mình sắp tới có ổn hơn không?",
      "Mình cần thay đổi gì trong cách chi tiêu?",
      "Có cơ hội tiền bạc nào đang tới gần không?",
    ],
    deepDiveSuggestions: [
      "Khoản chi hay dự định nào cần cân nhắc kỹ?",
      "Làm sao để túi tiền mình vững vàng hơn?",
      "Mình đang bỏ qua nguồn lực nào sẵn có?",
    ],
  },
  self: {
    id: "self",
    label: "Nội tâm",
    spreadPositions: ["Cảm xúc", "Nút thắt", "Xoa dịu"],
    sampleQuestions: [
      "Bên trong mình đang thật sự cảm thấy thế nào?",
      "Làm sao để mình bớt chênh vênh lúc này?",
      "Bản thân mình đang cần được vỗ về điều gì?",
    ],
    deepDiveSuggestions: [
      "Nỗi sợ nào đang âm thầm giữ chân mình?",
      "Thói quen nhỏ nào giúp mình thấy bình yên hơn?",
      "Mình cần nhắn nhủ với chính mình điều gì lúc này?",
    ],
  },
  crossroads: {
    id: "crossroads",
    label: "Ngã rẽ",
    spreadPositions: ["Lựa chọn A", "Lựa chọn B", "Điều cần cân tâm"],
    sampleQuestions: [
      "Giữa hai hướng đi này, đâu là lối hợp với mình hơn?",
      "Điều gì sẽ mở ra nếu mình dám bước sang trang mới?",
      "Mình đang phân vân vì điều gì sâu bên trong?",
    ],
    deepDiveSuggestions: [
      "Mình đang sợ mất điều gì nếu đưa ra quyết định?",
      "Có dấu hiệu nào giúp mình tin vào lựa chọn hơn?",
      "Điều gì quan trọng nhất với mình lúc này?",
    ],
  },
};

export const TOPIC_LIST: readonly TopicPreset[] = Object.values(TOPIC_PRESETS);

export const SUIT_LABELS = {
  major: "Ẩn Chính",
  wands: "Bộ Gậy",
  cups: "Bộ Cốc",
  swords: "Bộ Kiếm",
  pentacles: "Bộ Tiền",
} as const;

export const UI_TEXTS = {
  META: {
    TITLE: "aurae — Lắng nghe điều lòng muốn nói",
    DESCRIPTION:
      "Nơi bạn chậm lại một nhịp, rút một lá bài và trò chuyện cùng chính mình.",
  },
  HEADER: {
    BRAND_NAME: "aurae",
    SUBTITLE: "Góc nhỏ soi chiếu",
    BTN_HISTORY: "Nhật ký",
    BTN_NEW_READING: "Trải bài mới",
    BTN_THEME_LIGHT: "Nền sáng",
    BTN_THEME_DARK: "Nền tối",
    BTN_EXPAND_MENU: "Mở menu",
    BTN_COLLAPSE_MENU: "Thu gọn menu",
    MENU_TITLE: "Menu",
  },
  INTENTION: {
    HEADING: "Hôm nay lòng bạn đang nghĩ gì?",
    SUBHEADING: "Viết ra điều bạn đang bận tâm trước khi chọn bài nhé.",
    GUIDE_STEPS: [
      {
        numeral: "I",
        title: "Viết điều đang bận tâm",
        caption: "Chọn một chủ đề và đặt câu hỏi mở.",
      },
      {
        numeral: "II",
        title: "Chậm lại vài nhịp thở",
        caption: "Thả lỏng đầu óc để kết nối với hiện tại.",
      },
      {
        numeral: "III",
        title: "Chạm vào lá bài thu hút bạn",
        caption: "Mở ba lá bài và lắng nghe lời nhắn dành riêng cho mình.",
      },
    ],
    LABEL_TOPICS: "Chủ đề",
    INPUT_PLACEHOLDER: "Nhập câu hỏi của bạn ở đây...",
    LABEL_SAMPLES: "Hoặc chọn nhanh gợi ý",
    LABEL_REVERSED_TOGGLE: "Dùng cả lá bài ngược",
    REVERSED_HINT: "Nhìn thêm những góc khuất bên trong",
    BTN_SUBMIT: "Bắt đầu rút bài",
    VALIDATION_EMPTY: "Bạn hãy nhập câu hỏi hoặc chọn một gợi ý bên dưới nhé.",
    ERROR_EMPTY_QUESTION:
      "Bạn hãy nhập câu hỏi hoặc chọn một gợi ý bên dưới nhé.",
    VALIDATION_TOO_SHORT:
      "Câu hỏi hơi ngắn, bạn viết rõ hơn một chút nhé (ít nhất 6 ký tự).",
  },
  BREATHING: {
    PHASE_INHALE: "Hít vào thật sâu...",
    PHASE_HOLD: "Giữ lại một chút...",
    PHASE_EXHALE: "Thở ra nhẹ nhàng...",
    INSTRUCTION: "Thả lỏng vai và nghĩ về câu hỏi của bạn.",
    BTN_SKIP: "Bỏ qua",
  },
  SHUFFLING: {
    STATUS: "Đang tráo 78 lá bài...",
    SUBSTATUS: "Chờ một chút nhé, bài sắp sẵn sàng rồi",
  },
  DRAWING: {
    INSTRUCTION_TITLE: "Lướt nhẹ và chạm vào 3 lá bài gọi tên bạn",
    REMAINING_PREFIX: "Đã chọn",
    REMAINING_SEPARATOR: "/3 lá",
    ALL_DRAWN_HINT: "Đang lật mở lời nhắn...",
    CLARIFIER_PICK_TITLE: "Chọn thêm 1 lá bài làm rõ",
    BTN_CANCEL_CLARIFIER: "Đóng",
  },
  SYNTHESIS: {
    PANEL_TITLE: "Lời nhắn dành cho bạn",
    STREAMING_BADGE: "Đang viết...",
    COMPLETE_BADGE: "Đã xong",
    TAP_CARD_HINT: "Chạm vào từng lá bài để xem ý nghĩa chi tiết",
  },
  DEEP_DIVE: {
    SECTION_TITLE: "Hỏi thêm một chút",
    REMAINING_ROUNDS_LABEL: "Lượt còn lại:",
    CLARIFIER_BADGE_PREFIX: "Lá làm rõ #",
    CUSTOM_QUESTION_PLACEHOLDER: "Bạn muốn hỏi thêm điều gì nữa không?",
    BTN_DRAW_CLARIFIER: "Rút thêm 1 lá",
    MAX_ROUNDS_REACHED: "Bạn đã dùng hết 2 lượt hỏi thêm cho lần trải này rồi.",
    VALIDATION_EMPTY: "Bạn hãy nhập hoặc chọn một câu hỏi để rút thêm bài nhé.",
    ERROR_EMPTY_DEEP_DIVE:
      "Bạn hãy nhập hoặc chọn một câu hỏi để rút thêm bài nhé.",
  },
  CLOSURE: {
    BTN_OPEN_SHARE: "Lưu lại trải bài",
    SHARE_MODAL_TITLE: "Lưu thẻ chiêm nghiệm",
    SHARE_MODAL_SUBTITLE: "Chọn định dạng bạn muốn lưu về máy",
    GENERATING_IMAGE: "Đang chuẩn bị hình ảnh...",
    BTN_DOWNLOAD_IMAGE: "Tải ảnh PNG",
    BTN_CLOSE_MODAL: "Đóng",
    DOWNLOAD_SUCCESS: "Đã lưu ảnh vào máy của bạn.",
    IMAGE_ERROR: "Chưa tạo được ảnh lúc này, bạn thử lại nhé.",
    WATERMARK: "aurae",
    TEMPLATE_CORE_TITLE: "BA LÁ BÀI CỦA BẠN",
    TEMPLATE_CLARIFIER_TITLE: "LÁ BÀI LÀM RÕ",
    TEMPLATE_SYNTHESIS_TITLE: "LỜI NHẮN ĐỌNG LẠI",
    TEMPLATE_FILENAME_PREFIX: "aurae-",
  },
  HISTORY: {
    DRAWER_TITLE: "Những lần trải bài trước",
    EMPTY_STATE: "Bạn chưa có lần trải bài nào được lưu lại.",
    BTN_OPEN: "Xem lại",
    BTN_DELETE: "Xóa",
    CLARIFIER_COUNT_SUFFIX: "lá làm rõ",
  },
  DRAWER: {
    KEYWORDS_LABEL: "Từ khóa chính",
    MEANING_LABEL: "Lá bài muốn nói gì?",
    BTN_CLOSE: "Đóng",
  },
  ORIENTATION: {
    UPRIGHT: "Xuôi",
    REVERSED: "Ngược",
  },
  CARD_VISUAL: {
    PICK_THIS_CARD: "Chọn lá này",
  },
  ERRORS: {
    AI_STREAM_FAILED: "Đường truyền hơi chập chờn một chút, bạn thử lại nhé.",
    DECK_EXHAUSTED: "Bộ bài đã hết lá để rút thêm rồi.",
    STORAGE_READ_FAILED: "Không tải được lịch sử cũ trên trình duyệt này.",
    STORAGE_WRITE_FAILED: "Chưa lưu được phiên này vào bộ nhớ trình duyệt.",
  },
  COMMON: {
    LOADING: "Đang chuẩn bị...",
    QUESTION_LABEL: "Câu hỏi của bạn",
    CLARIFIER_SPREAD_LABEL: "Lá làm rõ",
  },
  ARIA: {
    CLOSE_OVERLAY: "Đóng cửa sổ",
    TOGGLE_REVERSED: "Bật hoặc tắt lá bài ngược",
  },
  AUDIO: {
    BTN_MUTE: "Tắt nhạc nền",
    BTN_UNMUTE: "Bật nhạc nền",
    LABEL_ON: "Nhạc nền: Bật",
    LABEL_OFF: "Nhạc nền: Tắt",
  },
} as const;
