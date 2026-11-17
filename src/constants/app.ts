import type { SuitType, TopicId, TopicPreset } from "@/types/tarot";

export const APP_ROUTES = {
  HOME: "/",
  API_READING: "/api/tarot/reading",
} as const;

export const STORAGE_KEYS = {
  CURRENT_SESSION: "aurae_tarot_current_session_v1",
  READING_HISTORY: "aurae_tarot_history_v1",
  PREFERENCES: "aurae_tarot_preferences_v1",
} as const;

export const TAROT_CONFIG = {
  TOTAL_CARDS: 78,
  INITIAL_DRAW_COUNT: 3,
  INITIAL_FAN_POOL_SIZE: 78,
  CLARIFIER_FAN_POOL_SIZE: 24,
  CARD_FLIP_DELAY_MS: 380,
  MAX_DEEP_DIVE_ROUNDS: 3,
  BREATHING_DURATION_MS: 4000,
  BREATHING_SKIP_DELAY_MS: 1500,
  SHUFFLE_DURATION_MS: 1500,
  REVEAL_TO_SYNTHESIS_DELAY_MS: 950,
  REVERSED_PROBABILITY: 0.3,
  STREAM_CHUNK_DELAY_MS: 22,
  MAX_HISTORY_ITEMS: 20,
  SHARE_IMAGE_WIDTH: 1080,
  SHARE_IMAGE_HEIGHT: 1920,
} as const;

export const SUIT_LABELS: Record<SuitType, string> = {
  major: "Ẩn Chính • Major Arcana",
  wands: "Bộ Gậy • Nguyên Tố Lửa",
  cups: "Bộ Cốc • Nguyên Tố Nước",
  swords: "Bộ Kiếm • Nguyên Tố Khí",
  pentacles: "Bộ Tiền • Nguyên Tố Đất",
} as const;

export const TOPIC_PRESETS: Record<TopicId, TopicPreset> = {
  general: {
    id: "general",
    label: "Tổng quan & Năng lượng",
    spreadPositions: ["Quá khứ", "Hiện tại", "Tương lai"],
    sampleQuestions: [
      "Thông điệp quan trọng nhất vũ trụ muốn gửi tới tôi lúc này là gì?",
      "Năng lượng chủ đạo của tôi trong 30 ngày tới sẽ diễn biến ra sao?",
      "Điều gì tôi đang vô tình bỏ lỡ trong bức tranh hiện tại?",
    ],
    deepDiveSuggestions: [
      "Tôi nên hành động cụ thể như thế nào ngay lúc này?",
      "Trở ngại ẩn giấu nào tôi cần đặc biệt lưu tâm?",
      "Bài học cốt lõi đằng sau giai đoạn này là gì?",
    ],
  },
  love: {
    id: "love",
    label: "Tình cảm & Kết nối",
    spreadPositions: ["Năng lượng bạn", "Đối phương", "Hướng phát triển"],
    sampleQuestions: [
      "Mối quan hệ hiện tại giữa tôi và người ấy đang thực sự đi về đâu?",
      "Điều gì đang cản trở sự kết nối sâu sắc trong đời sống tình cảm của tôi?",
      "Tôi cần chữa lành điều gì để đón nhận một mối quan hệ lành mạnh?",
    ],
    deepDiveSuggestions: [
      "Cảm xúc thật sự sâu bên trong người ấy là gì?",
      "Tôi nên chủ động tiến tới hay lùi lại quan sát?",
      "Kết quả khả dĩ nhất nếu tôi giữ vững ranh giới của mình?",
    ],
  },
  career: {
    id: "career",
    label: "Sự nghiệp & Định hướng",
    spreadPositions: ["Vị thế hiện tại", "Thử thách", "Hướng bứt phá"],
    sampleQuestions: [
      "Tôi có nên thay đổi môi trường làm việc hoặc rẽ hướng trong thời gian tới?",
      "Đâu là thế mạnh lớn nhất giúp tôi bứt phá trong dự án hiện tại?",
      "Hướng đi sự nghiệp nào phù hợp nhất với năng lượng của tôi lúc này?",
    ],
    deepDiveSuggestions: [
      "Rủi ro lớn nhất nếu tôi quyết định thay đổi ngay bây giờ là gì?",
      "Tôi cần trau dồi hoặc buông bỏ thói quen làm việc nào?",
      "Thời điểm thuận lợi để triển khai kế hoạch mới là khi nào?",
    ],
  },
  finance: {
    id: "finance",
    label: "Tài chính & Giá trị",
    spreadPositions: ["Dòng tiền hiện tại", "Điểm nghẽn", "Triển vọng"],
    sampleQuestions: [
      "Tình hình tài chính của tôi trong quý tới có những chuyển biến nào?",
      "Tôi cần điều chỉnh tư duy chi tiêu và đầu tư ra sao để vững vàng hơn?",
      "Cơ hội gia tăng thu nhập của tôi đang nằm ở khía cạnh nào?",
    ],
    deepDiveSuggestions: [
      "Khoản đầu tư hoặc quyết định tiền bạc này có an toàn không?",
      "Đâu là lỗ hổng khiến nguồn lực của tôi bị phân tán?",
      "Lời khuyên để duy trì sự ổn định dài hạn là gì?",
    ],
  },
  self: {
    id: "self",
    label: "Nội tâm & Chữa lành",
    spreadPositions: ["Tiềm thức", "Nút thắt", "Ánh sáng dẫn lối"],
    sampleQuestions: [
      "Tâm trí và cơ thể tôi đang khao khát điều gì nhất lúc này?",
      "Tôi cần buông bỏ chấp niệm nào để tìm lại sự bình an nội tại?",
      "Phiên bản trưởng thành hơn của tôi đang mời gọi tôi bước vào điều gì?",
    ],
    deepDiveSuggestions: [
      "Nỗi sợ vô thức nào đang chi phối quyết định của tôi?",
      "Thực hành tinh thần nào phù hợp nhất với tôi tuần này?",
      "Thông điệp động viên dành riêng cho trái tim tôi lúc này?",
    ],
  },
};

export const TOPIC_LIST: readonly TopicPreset[] = [
  TOPIC_PRESETS.general,
  TOPIC_PRESETS.love,
  TOPIC_PRESETS.career,
  TOPIC_PRESETS.finance,
  TOPIC_PRESETS.self,
];

export const UI_TEXTS = {
  META: {
    TITLE: "Aurae Tarot — Bàn Thờ Chiêm Tinh & Luận Giải Chuyên Sâu",
    DESCRIPTION:
      "Trải nghiệm rút bài Tarot chuẩn mực, tĩnh tại với không gian chiêm tinh hiện đại và luận giải AI sâu sắc.",
  },
  COMMON: {
    CLOSE: "Đóng",
    LOADING: "Đang tải...",
    QUESTION_LABEL: "Câu hỏi tâm ý",
    CORE_SPREAD_LABEL: "Bộ Ba Lá Chủ Đạo",
    CLARIFIER_SPREAD_LABEL: "Lá Bổ Trợ Đào Sâu",
  },
  HEADER: {
    BRAND_NAME: "AURAE TAROT",
    SUBTITLE: "Không gian chiêm nghiệm trực giác",
    BTN_HISTORY: "Lịch sử",
    BTN_NEW_READING: "Trải bài khác",
    BTN_THEME_LIGHT: "Chuyển giao diện sáng",
    BTN_THEME_DARK: "Chuyển giao diện tối",
  },
  CARD_VISUAL: {
    BACK_EMBLEM: "Aurae",
    PICK_THIS_CARD: "Chọn lá bài này",
    SECONDARY_DECK_LABEL: "Bộ bài bổ trợ",
    SECONDARY_DECK_HINT: "Chọn câu hỏi bên phải để rút thêm 1 lá",
  },
  INTENTION: {
    HEADING: "Bạn đang băn khoăn điều gì?",
    SUBHEADING:
      "Chọn một lĩnh vực bên dưới hoặc tự viết điều bạn đang trăn trở. Sự rõ ràng trong câu hỏi sẽ mở ra thông điệp sáng tỏ nhất.",
    INPUT_PLACEHOLDER:
      "Ví dụ: Tôi cần tập trung vào điều gì để vượt qua giai đoạn chững lại hiện tại?",
    LABEL_TOPICS: "Chủ đề trải bài",
    LABEL_SAMPLES: "Gợi ý câu hỏi chạm đúng trọng tâm",
    LABEL_REVERSED_TOGGLE: "Bao gồm lá bài ngược (Reversed)",
    REVERSED_HINT:
      "Bổ sung góc nhìn nội tâm, bài học ẩn giấu và các sắc thái sâu sắc hơn.",
    BTN_SUBMIT: "Bắt đầu tĩnh tâm & Xào bài",
    ERROR_EMPTY_QUESTION:
      "Hãy nhập câu hỏi hoặc chọn một gợi ý phía trên trước khi bắt đầu.",
  },
  BREATHING: {
    PHASE_INHALE: "Hít vào thật sâu...",
    PHASE_HOLD: "Giữ nhịp tĩnh lặng...",
    PHASE_EXHALE: "Thở ra nhẹ nhàng...",
    INSTRUCTION:
      "Tạm gác lại những xao nhãng bên ngoài, hướng toàn bộ sự chú ý vào câu hỏi của bạn.",
    BTN_SKIP: "Tôi đã sẵn sàng",
  },
  SHUFFLING: {
    STATUS: "Đang xào bài & dàn trải năng lượng...",
    SUBSTATUS: "78 lá bài đang được trải thành vòng cung trực giác",
  },
  DRAWING: {
    INSTRUCTION_TITLE: "Vuốt vòng cung bên dưới & chạm để tự rút 3 lá bài",
    REMAINING_PREFIX: "Đã chọn",
    REMAINING_SEPARATOR: "/3 lá bài",
    ALL_DRAWN_HINT: "Đã đủ 3 lá bài — Đang kết nối mạch luận giải...",
    CLARIFIER_PICK_TITLE: "Rút thêm 1 lá từ bộ bài bổ trợ bên dưới",
    BTN_CANCEL_CLARIFIER: "Hủy chọn lá bổ trợ",
  },
  ORIENTATION: {
    UPRIGHT: "Lá Xuôi",
    REVERSED: "Lá Ngược",
  },
  SYNTHESIS: {
    PANEL_TITLE: "Luận Giải Tổng Quan",
    STREAMING_BADGE: "Đang kết nối thông điệp...",
    COMPLETE_BADGE: "Hoàn tất tổng hợp",
    TAP_CARD_HINT:
      "Chạm vào từng lá bài đã mở để xem ý nghĩa nguyên bản chi tiết",
  },
  DEEP_DIVE: {
    SECTION_TITLE: "Đào Sâu Thông Điệp",
    REMAINING_ROUNDS_LABEL: "Lượt rút bổ trợ còn lại:",
    CUSTOM_QUESTION_PLACEHOLDER: "Hoặc đặt câu hỏi đào sâu của riêng bạn...",
    BTN_DRAW_CLARIFIER: "Mở bộ bài bổ trợ",
    CLARIFIER_BADGE_PREFIX: "Bổ trợ #",
    MAX_ROUNDS_REACHED:
      "Bạn đã hoàn thành tối đa 3 lượt đào sâu cho trải bài này.",
    ERROR_EMPTY_DEEP_DIVE:
      "Hãy chọn một câu hỏi gợi ý hoặc nhập điều bạn muốn hỏi sâu thêm.",
  },
  CLOSURE: {
    BTN_OPEN_SHARE: "Lưu ảnh kết quả 9:16",
    BTN_DOWNLOAD_IMAGE: "Tải ảnh về thiết bị",
    BTN_CLOSE_MODAL: "Đóng",
    SHARE_MODAL_TITLE: "Lưu giữ thông điệp chiêm tinh",
    SHARE_MODAL_SUBTITLE:
      "Định dạng chuẩn Story 9:16 sắc nét để lưu trữ hoặc chia sẻ",
    GENERATING_IMAGE: "Đang kết xuất tác phẩm 9:16...",
    DOWNLOAD_SUCCESS: "Đã tải ảnh kết quả 9:16 về thiết bị của bạn.",
    IMAGE_ERROR: "Không thể kết xuất ảnh lúc này. Vui lòng thử lại.",
    WATERMARK: "Aurae TAROT • CHIÊM NGHIỆM TRỰC GIÁC",
    TEMPLATE_CORE_TITLE: "BỘ BA LÁ CHỦ ĐẠO",
    TEMPLATE_CLARIFIER_TITLE: "LÁ BỔ TRỢ ĐÀO SÂU",
    TEMPLATE_SYNTHESIS_TITLE: "THÔNG ĐIỆP TỔNG HỢP",
    TEMPLATE_FILENAME_PREFIX: "Aurae-tarot-",
  },
  DRAWER: {
    KEYWORDS_LABEL: "Từ khóa năng lượng",
    MEANING_LABEL: "Ý nghĩa nguyên bản",
    BTN_CLOSE: "Đóng thẻ bài",
  },
  HISTORY: {
    DRAWER_TITLE: "Nhật Ký Trải Bài",
    EMPTY_STATE:
      "Chưa có trải bài nào được lưu. Hãy bắt đầu phiên chiêm nghiệm đầu tiên của bạn.",
    BTN_OPEN: "Xem lại",
    BTN_DELETE: "Xóa",
    CLARIFIER_COUNT_SUFFIX: "lá bổ trợ",
  },
  ARIA: {
    CLOSE_OVERLAY: "Đóng cửa sổ",
    TOGGLE_REVERSED: "Bật hoặc tắt chế độ lá bài ngược",
  },
  ERRORS: {
    STORAGE_READ_FAILED: "Không thể đọc dữ liệu lưu trữ cục bộ.",
    STORAGE_WRITE_FAILED: "Không thể lưu phiên trải bài vào thiết bị.",
    AI_STREAM_FAILED: "Kết nối luận giải bị gián đoạn. Vui lòng thử lại.",
    DECK_EXHAUSTED: "Không còn lá bài hợp lệ để rút thêm.",
  },
} as const;
