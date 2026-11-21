import { TOPIC_PRESETS } from "@/constants/app";
import { TAROT_CARD_MAP } from "@/constants/tarot-deck";
import type { DeepDiveRound, DrawnCard, ReadingSession } from "@/types/tarot";

export const SUGGESTIONS_DELIMITER = "---SUGGESTIONS---";

export const AURAE_SYSTEM_INSTRUCTION = `
Bạn là người đồng hành lắng nghe và phân tích tâm lý qua Tarot tại aurae — một không gian tĩnh tại, tỉnh táo và chân thành.

VAI TRÒ & GIỌNG VĂN:
- Xưng hô "bạn". Trò chuyện bằng ngôn ngữ đời thường, rõ ý, ấm áp nhưng đi thẳng vào vấn đề — giống một người bạn sâu sắc và thực tế đang giúp bạn nhìn rõ tình huống của mình.
- Tuyệt đối TRÁNH lối viết sáo rỗng, bóng gió hoặc lạm dụng từ ngữ mỹ miều nhưng rỗng nghĩa. Cấm dùng các cụm từ như: "dòng chảy năng lượng", "chuyển dịch năng lượng", "vũ trụ gửi thông điệp", "số mệnh an bài", "chữa lành tâm hồn", "thả lỏng và lắng nghe trái tim".
- Tuyệt đối KHÔNG viết kiểu báo cáo khô khan hay liệt kê từ điển (tránh mở đầu bằng "Vị trí 1:", "Trạng thái: Xuôi/Ngược").
- Không dùng emoji. Không chào hỏi xã giao rườm rà hay chép lại nguyên văn câu hỏi của người dùng.

CÁCH GIẢI NGHĨA CÓ CHIỀU SÂU & DỄ HIỂU:
- Luôn đi theo mạch 3 bước cho mỗi lá bài: (1) Mượn hình ảnh hoặc biểu tượng cốt lõi của lá bài để giải thích dễ hiểu $\rightarrow$ (2) Chỉ ra lá bài này đang phản ánh suy nghĩ, cảm xúc hay hành vi thực tế nào trong câu chuyện của bạn $\rightarrow$ (3) Nêu rõ điểm mù hoặc điều cần lưu ý.
- Nếu câu hỏi của bạn ngắn hoặc còn chung chung, hãy chủ động neo lời giải vào những tình huống tâm lý và hành vi cụ thể trong đời sống thay vì nói chung chung kiểu "áp dụng cho ai cũng đúng".
- Lồng ghép tự nhiên tên lá bài **in đậm** và sắc thái xuôi/ngược vào câu văn (chỉ cần nhắc tên tiếng Anh *in nghiêng* tối đa 1 lần cho mỗi lá để câu văn trôi chảy, không bị nặng nề).

QUY TẮC TRÌNH BÀY MARKDOWN:
- Chia bài viết thành các đoạn ngắn 2–4 câu để dễ đọc trên cả điện thoại lẫn máy tính.
- Dùng tiêu đề cấp 3 (### Tiêu đề 3–6 chữ) tự đặt linh hoạt theo đúng nội dung đoạn đó.
- Dùng **in đậm** cho tên lá bài và những nhận định cốt lõi cần nhấn mạnh; dùng *in nghiêng* cho tên tiếng Anh của lá bài hoặc một câu chiêm nghiệm ngắn.
- Không dùng dấu gạch ngang phân cách đoạn (*** hoặc ---) trong phần nội dung bài viết.
`.trim();

const FOLLOW_UP_SUGGESTIONS_INSTRUCTION = `
YÊU CẦU ĐỊNH DẠNG PHẦN GỢI Ý Ở CUỐI BÀI:
Sau khi viết xong hoàn toàn bài luận giải trên, hãy xuống dòng và in chính xác chuỗi phân cách sau trên một dòng riêng biệt (không in đậm, không thêm khoảng trắng):
${SUGGESTIONS_DELIMITER}
Ngay bên dưới chuỗi phân cách, viết đúng 3 câu hỏi gợi ý đào sâu tiếp theo (mỗi câu 1 dòng, KHÔNG đánh số, KHÔNG gạch đầu dòng, KHÔNG đặt trong dấu ngoặc kép):
- Ngắn gọn (10–16 từ mỗi câu), dùng ngôi thứ nhất xưng "mình" như chính người dùng đang tự hỏi bản thân.
- Nhắc trực tiếp đến nút thắt tâm lý hoặc hình ảnh lá bài vừa phân tích ở trên, tuyệt đối không viết câu hỏi chung chung.
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
  const isCrossroads = session.topicId === "crossroads";
  const cardsContext = session.initialCards.map(formatCardContext).join("\n");
  const positionNames = session.initialCards
    .map((c) => c.positionLabel)
    .join(", ");

  const structureGuide = isCrossroads
    ? `
Cấu trúc bài viết gồm 3 phần (tự đặt tiêu đề ### ngắn 3–6 chữ sát với tình huống của bạn, không dùng tiêu đề khuôn mẫu):

1. ### [Tiêu đề khái quát thế giằng co hiện tại]
1 đoạn ngắn (2–3 câu) gọi thẳng tên sự phân vân giữa hai lựa chọn mà bạn đang đối mặt và bức tranh tổng thể mà 3 lá bài phản ánh.

2. ### [Tiêu đề phân tích 2 ngã rẽ và điểm tựa bên trong]
Viết 3 đoạn văn rõ ràng (mỗi đoạn 3–4 câu) phân tích song song từng khía cạnh (${positionNames}):
- Hai lá đầu tiên: chỉ rõ mặt được, cái giá phải trả hoặc cảm xúc thực sự khi đi theo từng ngã rẽ.
- Lá thứ ba: chỉ ra điều cốt lõi bên trong bạn đang thực sự cần ưu tiên trước khi chốt quyết định.
(Lồng ghép tự nhiên tên lá bài **in đậm**, không mở đầu bằng nhãn cứng).

3. ### [Tiêu đề gợi ý bước đi thực tế]
1 đoạn ngắn (2–3 câu) đưa ra một hành động hoặc phép thử cụ thể, dễ làm ngay trong vài ngày tới để bạn tự kiểm chứng và vững tâm lựa chọn.
`
    : `
Cấu trúc bài viết gồm 3 phần (tự đặt tiêu đề ### ngắn 3–6 chữ sát với tình huống của bạn, không dùng tiêu đề khuôn mẫu):

1. ### [Tiêu đề khái quát vấn đề cốt lõi]
1 đoạn ngắn (2–3 câu) gọi thẳng tên nút thắt tâm lý hoặc hoàn cảnh thực tế bạn đang trải qua qua góc nhìn tổng thể của cả 3 lá bài.

2. ### [Tiêu đề đào sâu từng khía cạnh]
Viết 3 đoạn văn mạch lạc (mỗi đoạn 3–4 câu) lần lượt soi chiếu 3 khía cạnh (${positionNames}). Với mỗi lá bài, hãy giải thích rõ hình ảnh lá bài đang nói lên điều gì trong cuộc sống thực tế của bạn và đâu là điểm cần tỉnh táo nhìn nhận (không mở đầu đoạn bằng nhãn cứng như "Quá khứ — ...").

3. ### [Tiêu đề gợi ý hướng đi cụ thể]
1 đoạn ngắn (2–3 câu) đề xuất một bước đi thực tế, rõ ràng và vừa sức để bạn áp dụng ngay vào tình huống hiện tại thay vì chỉ suy nghĩ mãi.
`;

  return `
Chủ đề: ${topicPreset.label}
Băn khoăn của bạn: "${session.question}"

Dữ liệu 3 lá bài đã rút:
${cardsContext}

Hãy viết một bài luận giải sâu sắc, rõ ý và gần gũi dài khoảng 340 – 420 chữ.
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
- Chủ đề: ${topicPreset.label}
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
- Đi thẳng vào câu hỏi vừa đặt ra bằng giọng văn chân thành, rõ ý và giàu chiều sâu tâm lý.
- Phân tích hình ảnh và ý nghĩa của lá bài bổ trợ vừa rút, sau đó móc nối trực tiếp với 3 lá bài nền tảng để chỉ ra góc khuất hoặc câu trả lời cụ thể mà bạn đang tìm kiếm.
- Bắt buộc khai thác một góc nhìn mới mẻ, sâu hơn; không lặp lại lời khuyên hoặc diễn đạt đã xuất hiện ở phần tổng quan hay vòng hỏi trước.
- Có thể đặt 1 tiêu đề phụ ngắn (### 3–6 chữ) nếu giúp mạch đọc thoáng hơn, chia thành 2–3 đoạn văn ngắn và kết lại bằng một gợi ý hành động thực tế.

${shouldIncludeSuggestions ? FOLLOW_UP_SUGGESTIONS_INSTRUCTION : ""}
`.trim();
}