import type { TopicId, TopicPreset } from '@/types/tarot';

export const STORAGE_KEYS = {
  ACTIVE_SESSION: 'aurae_active_session_v1',
  READING_HISTORY: 'aurae_history_v1',
  THEME_MODE: 'aurae_theme_v1',
} as const;

export const TAROT_CONFIG = {
  INITIAL_DRAW_COUNT: 3,
  MAX_DEEP_DIVE_ROUNDS: 2,
  MAX_HISTORY_ITEMS: 30,
  BREATHING_DURATION_MS: 3200,
  BREATHING_SKIP_DELAY_MS: 1200,
  SHUFFLE_DURATION_MS: 1500,
  REVERSED_PROBABILITY: 0.35,
  STREAM_CHUNK_DELAY_MS: 24,
  SHARE_IMAGE_WIDTH: 1080,
  SHARE_IMAGE_HEIGHT: 1920,
} as const;

export const TOPIC_PRESETS: Record<TopicId, TopicPreset> = {
  general: {
    id: 'general',
    label: 'Tổng quan',
    spreadPositions: ['Quá khứ', 'Hiện tại', 'Tương lai'],
    sampleQuestions: [
      'Thông điệp nào tôi cần lưu tâm nhất lúc này?',
      'Năng lượng chủ đạo của tôi trong tháng tới là gì?',
      'Điều gì đang âm thầm chuyển dịch quanh tôi?',
    ],
    deepDiveSuggestions: [
      'Tôi nên buông bỏ điều gì để nhẹ lòng hơn?',
      'Hành động thiết thực nào nên làm ngay tuần này?',
      'Đâu là điểm mù tôi chưa nhận ra?',
    ],
  },
  love: {
    id: 'love',
    label: 'Tình cảm',
    spreadPositions: ['Bạn', 'Người ấy', 'Kết nối'],
    sampleQuestions: [
      'Mối quan hệ hiện tại đang đi về đâu?',
      'Cảm xúc thật sự người ấy dành cho tôi là gì?',
      'Tôi cần chữa lành điều gì để đón tình yêu mới?',
    ],
    deepDiveSuggestions: [
      'Rào cản lớn nhất giữa hai người là gì?',
      'Tôi nên chủ động hay kiên nhẫn chờ đợi?',
      'Bài học cốt lõi của kết nối này là gì?',
    ],
  },
  career: {
    id: 'career',
    label: 'Sự nghiệp',
    spreadPositions: ['Nền tảng', 'Thử thách', 'Hướng đi'],
    sampleQuestions: [
      'Cơ hội phát triển công việc sắp tới của tôi thế nào?',
      'Tôi có nên thay đổi hướng đi hiện tại không?',
      'Thế mạnh nào giúp tôi bứt phá giai đoạn này?',
    ],
    deepDiveSuggestions: [
      'Rủi ro nào cần đề phòng trước khi quyết định?',
      'Kỹ năng nào tôi cần tập trung trau dồi nhất?',
      'Thời điểm thuận lợi để hành động là khi nào?',
    ],
  },
  finance: {
    id: 'finance',
    label: 'Tài chính',
    spreadPositions: ['Hiện trạng', 'Dòng chảy', 'Lời khuyên'],
    sampleQuestions: [
      'Tình hình tài chính của tôi thời gian tới ra sao?',
      'Tôi cần điều chỉnh gì trong cách quản lý tiền bạc?',
      'Có cơ hội gia tăng thu nhập nào đang mở ra?',
    ],
    deepDiveSuggestions: [
      'Khoản chi hay đầu tư nào tôi cần thận trọng?',
      'Làm sao để củng cố sự ổn định tài chính?',
      'Tôi đang bỏ lỡ nguồn lực nào sẵn có?',
    ],
  },
  growth: {
    id: 'growth',
    label: 'Nội tâm',
    spreadPositions: ['Tâm thức', 'Nút thắt', 'Ánh sáng'],
    sampleQuestions: [
      'Cảm xúc sâu kín nào của tôi đang cần được lắng nghe?',
      'Làm sao để tìm lại sự cân bằng bên trong?',
      'Phiên bản trưởng thành hơn của tôi đang gọi tên điều gì?',
    ],
    deepDiveSuggestions: [
      'Nỗi sợ vô hình nào đang kìm chân tôi?',
      'Thói quen tinh thần nào giúp tôi bình an hơn?',
      'Thông điệp cốt lõi dành cho tâm hồn tôi lúc này?',
    ],
  },
};

export const TOPIC_LIST: readonly TopicPreset[] = Object.values(TOPIC_PRESETS);

export const SUIT_LABELS = {
  major: 'Bộ Ẩn Chính',
  wands: 'Bộ Gậy',
  cups: 'Bộ Cốc',
  swords: 'Bộ Kiếm',
  pentacles: 'Bộ Tiền',
} as const;

export const UI_TEXTS = {
  META: {
    TITLE: 'aurae — Chiêm Nghiệm & Trực Giác',
    DESCRIPTION: 'Không gian trải bài Tarot tinh giản và chiêm nghiệm sâu sắc.',
  },
  HEADER: {
    BRAND_NAME: 'aurae',
    SUBTITLE: 'Chiêm nghiệm & Trực giác',
    BTN_HISTORY: 'Lịch sử',
    BTN_NEW_READING: 'Trải mới',
    BTN_THEME_LIGHT: 'Chế độ sáng',
    BTN_THEME_DARK: 'Chế độ tối',
    BTN_EXPAND_MENU: 'Mở thanh điều hướng',
    BTN_COLLAPSE_MENU: 'Thu gọn thanh điều hướng',
    MENU_TITLE: 'Điều hướng',
  },
  INTENTION: {
    HEADING: 'Đặt ý niệm của bạn',
    SUBHEADING: 'Gửi một câu hỏi rõ ràng trước khi mở bài.',
    GUIDE_STEPS: [
      {
        numeral: 'I',
        title: 'Gửi trọn điều đang bận tâm',
        caption: 'Chọn chủ đề và viết câu hỏi mở từ trực giác.',
      },
      {
        numeral: 'II',
        title: 'Lắng dịu qua ba nhịp thở',
        caption: 'Tách mình khỏi xao nhãng để kết nối với hiện tại.',
      },
      {
        numeral: 'III',
        title: 'Chạm vào lá bài gọi tên bạn',
        caption: 'Ba lá bài soi chiếu toàn cảnh và mở lối đào sâu.',
      },
    ],
    LABEL_TOPICS: 'Chủ đề',
    INPUT_PLACEHOLDER: 'Nhập điều bạn đang trăn trở...',
    LABEL_SAMPLES: 'Gợi ý nhanh',
    LABEL_REVERSED_TOGGLE: 'Cho phép lá ngược',
    REVERSED_HINT: 'Bổ sung sắc thái nội tâm & góc khuất',
    BTN_SUBMIT: 'Bắt đầu trải bài',
    VALIDATION_EMPTY: 'Hãy nhập câu hỏi hoặc chọn một gợi ý.',
    VALIDATION_TOO_SHORT: 'Câu hỏi cần ít nhất 6 ký tự.',
  },
  BREATHING: {
    PHASE_INHALE: 'Hít vào chậm rãi...',
    PHASE_HOLD: 'Giữ nhịp tĩnh lặng...',
    PHASE_EXHALE: 'Thở ra nhẹ nhàng...',
    INSTRUCTION: 'Giữ trọn câu hỏi trong tâm trí.',
    BTN_SKIP: 'Bỏ qua',
  },
  SHUFFLING: {
    STATUS: 'Đang xào 78 lá bài...',
    SUBSTATUS: 'Hòa nhịp cùng trực giác của bạn',
  },
  DRAWING: {
    INSTRUCTION_TITLE: 'Kéo vòng cung và chạm vào lá bài thu hút bạn',
    REMAINING_PREFIX: 'Đã chọn',
    REMAINING_SEPARATOR: '/3 lá',
    ALL_DRAWN_HINT: 'Đang mở thông điệp...',
    CLARIFIER_PICK_TITLE: 'Chọn 1 lá bổ trợ',
    BTN_CANCEL_CLARIFIER: 'Đóng',
  },
  SYNTHESIS: {
    PANEL_TITLE: 'Thông điệp trải bài',
    STREAMING_BADGE: 'Đang luận giải',
    COMPLETE_BADGE: 'Hoàn tất',
    TAP_CARD_HINT: 'Chạm vào lá bài để xem chi tiết',
  },
  DEEP_DIVE: {
    SECTION_TITLE: 'Hỏi sâu thêm',
    REMAINING_ROUNDS_LABEL: 'Lượt còn lại:',
    CLARIFIER_BADGE_PREFIX: 'Bổ trợ #',
    CUSTOM_QUESTION_PLACEHOLDER: 'Đặt câu hỏi đào sâu...',
    BTN_DRAW_CLARIFIER: 'Rút lá bổ trợ',
    MAX_ROUNDS_REACHED: 'Đã hoàn tất 2 lượt hỏi bổ trợ.',
    VALIDATION_EMPTY: 'Hãy nhập hoặc chọn một câu hỏi bổ trợ.',
  },
  CLOSURE: {
    BTN_OPEN_SHARE: 'Lưu thẻ bài 9:16',
    SHARE_MODAL_TITLE: 'Thẻ lưu niệm trải bài',
    SHARE_MODAL_SUBTITLE: 'Định dạng dọc 9:16 sẵn sàng chia sẻ',
    GENERATING_IMAGE: 'Đang tạo thẻ ảnh...',
    BTN_DOWNLOAD_IMAGE: 'Tải ảnh PNG',
    BTN_CLOSE_MODAL: 'Đóng',
    DOWNLOAD_SUCCESS: 'Đã tải ảnh về thiết bị.',
    IMAGE_ERROR: 'Không thể xuất ảnh, vui lòng thử lại.',
    WATERMARK: 'aurae',
    TEMPLATE_CORE_TITLE: 'BA LÁ BÀI CHỦ ĐẠO',
    TEMPLATE_CLARIFIER_TITLE: 'LÁ BÀI BỔ TRỢ',
    TEMPLATE_SYNTHESIS_TITLE: 'THÔNG ĐIỆP CỐT LÕI',
    TEMPLATE_FILENAME_PREFIX: 'aurae-',
  },
  HISTORY: {
    DRAWER_TITLE: 'Nhật ký trải bài',
    EMPTY_STATE: 'Chưa có phiên trải bài nào được lưu.',
    BTN_OPEN: 'Xem lại',
    BTN_DELETE: 'Xóa',
    CLARIFIER_COUNT_SUFFIX: 'bổ trợ',
  },
  DRAWER: {
    KEYWORDS_LABEL: 'Từ khóa',
    MEANING_LABEL: 'Ý nghĩa biểu tượng',
    BTN_CLOSE: 'Đóng',
  },
  ORIENTATION: {
    UPRIGHT: 'Xuôi',
    REVERSED: 'Ngược',
  },
  CARD_VISUAL: {
    PICK_THIS_CARD: 'Chọn lá bài này',
  },
  COMMON: {
    LOADING: 'Đang chuẩn bị...',
    QUESTION_LABEL: 'Ý niệm',
    CLARIFIER_SPREAD_LABEL: 'Lá bổ trợ',
  },
  ARIA: {
    CLOSE_OVERLAY: 'Đóng cửa sổ',
    TOGGLE_REVERSED: 'Bật hoặc tắt lá bài ngược',
  },
} as const;