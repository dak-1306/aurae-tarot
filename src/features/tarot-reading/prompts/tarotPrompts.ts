import { TOPIC_PRESETS } from "@/constants/app";
import { TAROT_CARD_MAP } from "@/constants/tarot-deck";
import type {
  DeepDiveRound,
  DrawnCard,
  ReadingSession,
  TopicId,
} from "@/types/tarot";

export const SUGGESTIONS_DELIMITER = "---SUGGESTIONS---";

const TOPIC_ANGLE_GUIDANCE: Record<TopicId, string> = {
  general:
    "Góc nhìn tổng quan: Tập trung vào bức tranh toàn cảnh, điều gì đang chiếm nhiều tâm trí nhất và đâu là điểm tựa giúp bạn cân bằng lại cuộc sống lúc này.",
  love:
    "Góc nhìn tình cảm: Tập trung vào sự tương tác thực tế giữa hai người, nhu cầu cảm xúc thật sự bên trong, mức độ an toàn và ranh giới lành mạnh trong mối quan hệ.",
  career:
    "Góc nhìn công việc: Tập trung vào định hướng phát triển, năng lực thực tế, môi trường làm việc, áp lực hiệu suất và cơ hội bứt phá hoặc chuyển hướng.",
  finance:
    "Góc nhìn tài chính: Tập trung vào sự ổn định dòng tiền, thói quen chi tiêu/đầu tư, mức độ rủi ro hiện tại và tính kỷ luật thực tế thay vì cảm tính.",
  self:
    "Góc nhìn nội tâm & phát triển bản thân: Tập trung vào niềm tin giới hạn, thói quen phản ứng cảm xúc, điều bạn đang tự kìm hãm hoặc bài học trưởng thành cốt lõi.",
  crossroads:
    "Góc nhìn ngã rẽ lựa chọn: So sánh trực diện cái được – cái mất của từng phương án và chỉ rõ lựa chọn nào phù hợp hơn với giá trị cốt lõi của bạn lúc này.",
};

export const AURAE_SYSTEM_INSTRUCTION = `
Bạn là người đồng hành lắng nghe và luận giải Tarot tại aurae — một không gian chiêm nghiệm tỉnh táo, sâu sắc và chân thành.

NGUYÊN TẮC CỐT LÕI — TRẢ LỜI THẲNG TRƯỚC, GIẢI THÍCH SAU:
- Luôn đọc kỹ dạng câu hỏi của người dùng và giải đáp trực diện ngay trong đoạn mở đầu trước khi đi vào phân tích từng lá bài:
  + Nếu hỏi "Có nên... không?" / câu hỏi Có - Không: Chốt rõ cán cân của bộ bài đang nghiêng về hướng nào (nên làm, chưa nên vội, hoặc chỉ nên làm khi kèm điều kiện cụ thể) ngay từ câu đầu tiên. Tuyệt đối không vòng vo né tránh.
  + Nếu hỏi so sánh "Nên chọn A hay B?": Chỉ rõ phương án nào đang có lực đẩy và sự phù hợp cao hơn ở thời điểm hiện tại.
  + Nếu hỏi "Tại sao..." / "Họ nghĩ gì..." / "Tình hình đang ra sao...": Nêu thẳng bản chất cốt lõi của tình huống hoặc động lực thật sự phía sau.
  + Nếu hỏi "Khi nào..." / "Sắp tới thế nào...": Nêu rõ nhịp độ tiến triển (đang thuận đà tiến nhanh, cần thêm thời gian chuẩn bị, hay đang chững lại để chờ bạn giải quyết một nút thắt).
  + Nếu hỏi "Mình cần làm gì...": Chốt ngay việc quan trọng nhất cần ưu tiên lúc này.

GIỌNG VĂN & CHẤT LƯỢNG NỘI DUNG:
- Xưng hô "bạn". Ngôn ngữ đời thường, sáng rõ, ấm áp nhưng sắc bén và thực tế — như một người bạn hiểu chuyện giúp bạn nhìn thấu vấn đề.
- Tuyệt đối TRÁNH lối viết bóng gió, sáo rỗng hoặc lạm dụng từ ngữ mỹ miều rỗng nghĩa. Cấm dùng các cụm từ: "dòng chảy năng lượng", "chuyển dịch năng lượng", "vũ trụ gửi thông điệp", "số mệnh an bài", "chữa lành tâm hồn", "thả lỏng và lắng nghe trái tim".
- Tuyệt đối KHÔNG viết kiểu báo cáo từ điển hay mở đầu bằng nhãn cứng như "Vị trí 1:", "Quá khứ —", "Trạng thái: Xuôi/Ngược".
- Không dùng emoji. Không chào hỏi xã giao rườm rà hay chép lại nguyên văn câu hỏi.
- Với mỗi lá bài, luôn gắn hình ảnh biểu tượng của lá bài với hành vi, suy nghĩ hoặc hoàn cảnh thực tế của người hỏi. Lồng ghép tự nhiên tên lá bài **in đậm** (chỉ kèm tên tiếng Anh *in nghiêng* tối đa 1 lần cho mỗi lá).

QUY TẮC TRÌNH BÀY MARKDOWN:
- Chia bài viết thành các đoạn ngắn 2–4 câu để dễ đọc trên cả điện thoại lẫn máy tính.
- Dùng tiêu đề cấp 3 (### Tiêu đề 3–6 chữ) tự đặt linh hoạt bám sát nội dung đoạn đó.
- Dùng **in đậm** cho tên lá bài và các kết luận cốt lõi; dùng *in nghiêng* cho tên tiếng Anh của lá bài hoặc một câu đúc kết ngắn.
- Không dùng dấu gạch ngang phân cách đoạn (*** hoặc ---) trong phần nội dung bài viết.
`.trim();

const FOLLOW_UP_SUGGESTIONS_INSTRUCTION = `
YÊU CẦU ĐỊNH DẠNG PHẦN GỢI Ý Ở CUỐI BÀI:
Sau khi viết xong hoàn toàn bài luận giải trên, hãy xuống dòng và in chính xác chuỗi phân cách sau trên một dòng riêng biệt (không in đậm, không thêm khoảng trắng):
${SUGGESTIONS_DELIMITER}
Ngay bên dưới chuỗi phân cách, viết đúng 3 câu hỏi gợi ý đào sâu tiếp theo (mỗi câu 1 dòng, KHÔNG đánh số, KHÔNG gạch đầu dòng, KHÔNG đặt trong dấu ngoặc kép):
- Ngắn gọn (10–16 từ mỗi câu), dùng ngôi thứ nhất xưng "mình" như chính người dùng đang tự hỏi bản thân.
- Nhắc trực tiếp đến nút thắt thực tế hoặc lá bài vừa phân tích ở trên, tuyệt đối không viết câu hỏi chung chung.
- Mỗi câu khai thác 1 góc nhìn khác nhau: (1) nguyên nhân sâu xa bên trong, (2) tác động từ hoàn cảnh hoặc người liên quan, (3) một bước đi thực tế tiếp theo.

Ví dụ mẫu đúng định dạng phần cuối:
${SUGGESTIONS_DELIMITER}
Điều gì khiến mình vẫn còn chần chừ chưa dám nói thẳng suy nghĩ này?
Nếu tạm gác kỳ vọng của người khác sang một bên, mình thực sự muốn chọn hướng nào?
Đâu là ranh giới nhỏ mình có thể đặt ra ngay trong tuần này để bớt áp lực?
`.trim();

function formatCardContext(card: DrawnCard): string {
  const def = TAROT_CARD_MAP[card.cardId];
  if (!def) {
    return `• Khía cạnh "${card.positionLabel}": lá ${card.cardId} (${card.orientation === "reversed" ? "chiều ngược" : "chiều xuôi"})`;
  }

  const isReversed = card.orientation === "reversed";
  const orientationNote = isReversed ? "chiều ngược" : "chiều xuôi";
  const keywords = (
    isReversed ? def.keywordsReversed : def.keywordsUpright
  ).join(", ");
  const coreMeaning = isReversed ? def.meaningReversed : def.meaningUpright;

  return `• Khía cạnh "${card.positionLabel}": lá **${def.nameVi}** (*${def.nameEn}*) ở ${orientationNote} | Từ khóa: ${keywords} | Ý gốc tham khảo (không chép nguyên văn): ${coreMeaning}`;
}

export function buildSynthesisPrompt(session: ReadingSession): string {
  const topicPreset = TOPIC_PRESETS[session.topicId] ?? TOPIC_PRESETS.general;
  const topicGuidance =
    TOPIC_ANGLE_GUIDANCE[session.topicId] ?? TOPIC_ANGLE_GUIDANCE.general;
  const isCrossroads = session.topicId === "crossroads";
  const cardsContext = session.initialCards.map(formatCardContext).join("\n");
  const positionNames = session.initialCards
    .map((c) => c.positionLabel)
    .join(", ");

  const structureGuide = isCrossroads
    ? `
Cấu trúc bài viết gồm 3 phần (tự đặt tiêu đề ### ngắn 3–6 chữ sát với tình huống, không dùng tiêu đề khuôn mẫu):

1. ### [Tiêu đề chốt hướng lựa chọn]
1 đoạn ngắn (2–3 câu) trả lời thẳng vào sự phân vân của bạn ngay từ câu đầu tiên: chỉ rõ giữa hai ngã rẽ, hướng nào đang chiếm ưu thế hoặc điều kiện tiên quyết nào cần có trước khi quyết định.

2. ### [Tiêu đề so sánh 2 ngã rẽ và điểm tựa bên trong]
Viết 3 đoạn văn mạch lạc (mỗi đoạn 3–4 câu) phân tích lần lượt 3 khía cạnh (${positionNames}):
- Hai lá đầu tiên: chỉ rõ mặt được, rủi ro thực tế và trạng thái của bạn nếu đi theo từng lựa chọn.
- Lá thứ ba: chỉ ra giá trị cốt lõi bên trong bạn cần đặt lên bàn cân để không hối tiếc.

3. ### [Tiêu đề bước kiểm chứng thực tế]
1 đoạn ngắn (2–3 câu) gợi ý một hành động hoặc phép thử nhỏ, cụ thể ngay trong vài ngày tới để bạn tự kiểm chứng và chốt quyết định.
`
    : `
Cấu trúc bài viết gồm 3 phần (tự đặt tiêu đề ### ngắn 3–6 chữ sát với tình huống, không dùng tiêu đề khuôn mẫu):

1. ### [Tiêu đề trả lời trực diện câu hỏi]
1 đoạn ngắn (2–3 câu) đáp thẳng vào trọng tâm câu hỏi của bạn ngay từ câu đầu tiên (Có/Nên hay chưa nên, bản chất vấn đề là gì, hoặc xu hướng đang nghiêng về đâu) dựa trên tín hiệu chung của cả 3 lá bài.

2. ### [Tiêu đề lý giải chi tiết qua từng lá bài]
Viết 3 đoạn văn mạch lạc (mỗi đoạn 3–4 câu) lần lượt giải mã 3 khía cạnh (${positionNames}) để chứng minh cho kết luận ở trên. Với mỗi lá bài, hãy gắn hình ảnh lá bài với hành vi, cảm xúc hoặc hoàn cảnh thực tế của bạn và chỉ rõ điểm cần lưu ý.

3. ### [Tiêu đề hành động cụ thể tiếp theo]
1 đoạn ngắn (2–3 câu) đề xuất một bước đi thực tế, rõ ràng và vừa sức để bạn áp dụng ngay vào tình huống hiện tại.
`;

  return `
Chủ đề: ${topicPreset.label}
${topicGuidance}
Câu hỏi của bạn: "${session.question}"

Dữ liệu 3 lá bài đã rút:
${cardsContext}

Hãy viết một bài luận giải sắc sảo, dễ hiểu và sát thực tế dài khoảng 340 – 420 chữ.
${structureGuide.trim()}

${FOLLOW_UP_SUGGESTIONS_INSTRUCTION}
`.trim();
}

export function buildCumulativeDeepDivePrompt(
  session: ReadingSession,
  targetRound: DeepDiveRound,
  shouldIncludeSuggestions = true,
): string {
  const topicPreset = TOPIC_PRESETS[session.topicId] ?? TOPIC_PRESETS.general;
  const topicGuidance =
    TOPIC_ANGLE_GUIDANCE[session.topicId] ?? TOPIC_ANGLE_GUIDANCE.general;
  const initialCardsContext = session.initialCards
    .map(formatCardContext)
    .join("\n");

  const priorRounds = session.deepDiveRounds.filter(
    (r) => r.round < targetRound.round && r.aiResponse.trim().length > 0,
  );

  const priorRoundsContext =
    priorRounds.length > 0
      ? priorRounds
          .map(
            (r) =>
              `Nhịp hỏi trước (#${r.round}): "${r.question}" -> ${formatCardContext(r.clarifierCard)}\nNội dung đã phân tích: ${r.aiResponse}`,
          )
          .join("\n\n")
      : "Chưa có nhịp hỏi bổ trợ trước đó.";

  return `
BỐI CẢNH TRẢI BÀI BAN ĐẦU:
- Chủ đề: ${topicPreset.label} (${topicGuidance})
- Câu hỏi gốc: "${session.question}"
- 3 lá bài nền tảng:
${initialCardsContext}

TÓM TẮT MẠCH PHÂN TÍCH TRƯỚC ĐÓ (KHÔNG LẶP LẠI Ý ĐÃ NÓI):
${session.synthesisText || "(Tham chiếu trực tiếp từ 3 lá bài nền tảng)"}

CÁC NHỊP HỎI ĐÀO SÂU TRƯỚC ĐÓ:
${priorRoundsContext}

CÂU HỎI ĐÀO SÂU MỚI CẦN GIẢI ĐÁP:
- Câu hỏi của bạn: "${targetRound.question}"
- Lá bài bổ trợ vừa rút được:
${formatCardContext(targetRound.clarifierCard)}

HƯỚNG DẪN VIẾT PHẢN HỒI (khoảng 200 – 270 chữ):
- Câu mở đầu PHẢI trả lời trực diện ngay vào câu hỏi đào sâu vừa đặt ra dựa trên lá bài bổ trợ vừa rút (không rào đón vòng vo).
- Sau đó, phân tích hình ảnh của lá bài bổ trợ và móc nối với 3 lá bài nền tảng để làm rõ lý do, góc khuất hoặc điều kiện thực tế đằng sau câu trả lời đó.
- Bắt buộc khai thác một lớp nghĩa mới, sâu hơn; không lặp lại lời khuyên hoặc cách diễn đạt đã xuất hiện ở phần tổng quan hay vòng hỏi trước.
- Có thể đặt 1 tiêu đề phụ ngắn (### 3–6 chữ) nếu giúp mạch đọc thoáng hơn, chia thành 2–3 đoạn văn ngắn và kết lại bằng một gợi ý hành động cụ thể.

${shouldIncludeSuggestions ? FOLLOW_UP_SUGGESTIONS_INSTRUCTION : ""}
`.trim();
}