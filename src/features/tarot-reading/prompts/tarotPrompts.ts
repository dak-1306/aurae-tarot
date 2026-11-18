import { TOPIC_PRESETS } from '@/constants/app';
import { TAROT_CARD_MAP } from '@/constants/tarot-deck';
import type { DeepDiveRound, DrawnCard, ReadingSession } from '@/types/tarot';

export const AURAE_SYSTEM_INSTRUCTION = `
Bạn là người đồng hành lắng nghe và soi chiếu nội tâm tại aurae — một không gian chiêm nghiệm Tarot tĩnh tại, ấm áp và chữa lành.

PHONG CÁCH & GIỌNG VĂN:
- Xưng hô "bạn", trò chuyện bằng giọng văn thủ thỉ, dịu dàng, thấu cảm nhưng vẫn tỉnh táo và sâu sắc — như một người bạn hiểu chuyện đang ngồi cạnh lắng nghe tâm tư của bạn.
- Tuyệt đối KHÔNG dùng văn phong báo cáo khô khan, liệt kê kiểu từ điển hay các nhãn kỹ thuật như "Vị trí [...]", "Trạng thái: Xuôi/Ngược".
- Tuyệt đối KHÔNG dùng ngôn ngữ mê tín, phán xét, dọa dẫm hay định mệnh hóa (tránh "vũ trụ gửi thông điệp", "thầy phán", "số mệnh an bài").
- Không dùng emoji. Không chào hỏi xã giao rườm rà hay chép lại nguyên văn câu hỏi.
- Hãy lồng ghép tên lá bài (in đậm) và sắc thái xuôi/ngược một cách tự nhiên, mềm mại vào dòng chảy tâm lý và bối cảnh câu hỏi của người dùng.

QUY TẮC TRÌNH BÀY MARKDOWN:
- Chia bài viết thành các đoạn ngắn (2–3 câu mỗi đoạn) để tạo khoảng thở nhẹ nhàng khi đọc.
- Dùng tiêu đề cấp 3 (### Tiêu đề ngắn gọn, giàu chất thơ) để chuyển nhịp cảm xúc.
- Dùng **in đậm** cho tên lá bài hoặc ý chạm sâu, và *in nghiêng* cho tên tiếng Anh của lá bài hoặc lời nhắn chiêm nghiệm.
- Không dùng chuỗi ký tự *** để ngăn cách đoạn.
`.trim();

function formatCardContext(card: DrawnCard): string {
  const def = TAROT_CARD_MAP[card.cardId];
  if (!def) {
    return `• Khía cạnh "${card.positionLabel}": lá ${card.cardId} (${card.orientation === 'reversed' ? 'chiều ngược' : 'chiều xuôi'})`;
  }

  const isReversed = card.orientation === 'reversed';
  const orientationNote = isReversed ? 'chiều ngược' : 'chiều xuôi';
  const keywords = (isReversed ? def.keywordsReversed : def.keywordsUpright).join(', ');
  const coreMeaning = isReversed ? def.meaningReversed : def.meaningUpright;

  return `• Khía cạnh "${card.positionLabel}": lá **${def.nameVi}** (*${def.nameEn}*) ở ${orientationNote} — Gợi mở: ${keywords}. (${coreMeaning})`;
}

export function buildSynthesisPrompt(session: ReadingSession): string {
  const topicPreset = TOPIC_PRESETS[session.topicId] ?? TOPIC_PRESETS.general;
  const cardsContext = session.initialCards.map(formatCardContext).join('\n');

  return `
Chủ đề tâm tư: ${topicPreset.label}
Điều bạn đang băn khoăn: "${session.question}"

Dữ liệu 3 lá bài đã rút (chỉ dùng để thấu hiểu, không chép lại nguyên văn nhãn):
${cardsContext}

Hãy viết một bài luận giải chữa lành dài khoảng 240 – 320 chữ theo 3 nhịp cảm xúc sau:

### Dòng chảy chung của trải bài
1 đoạn ngắn (2–3 câu) đón nhận băn khoăn của bạn bằng sự đồng cảm nhẹ nhàng và phác họa bức tranh chuyển dịch năng lượng xuyên suốt 3 lá bài.

### Lắng nghe từng lá bài
Viết 3 đoạn văn ngắn liền mạch (mỗi đoạn 2–3 câu) tương ứng với 3 khía cạnh (${session.initialCards.map((c) => c.positionLabel).join(', ')}). Lồng ghép tự nhiên tên lá bài **in đậm** (*tên tiếng Anh in nghiêng*) cùng sắc thái xuôi/ngược vào câu chuyện cảm xúc của bạn, tuyệt đối không mở đầu bằng nhãn cứng như "Quá khứ — ...".

### Một lời nhắn dịu dàng
1 đoạn ngắn (2 câu) gợi mở sự thả lỏng, tự chăm sóc nội tâm hoặc một bước đi nhẹ nhàng, thực tế để bạn vững tâm hơn.
`.trim();
}

export function buildCumulativeDeepDivePrompt(
  session: ReadingSession,
  targetRound: DeepDiveRound
): string {
  const topicPreset = TOPIC_PRESETS[session.topicId] ?? TOPIC_PRESETS.general;
  const initialCardsContext = session.initialCards.map(formatCardContext).join('\n');

  const priorRounds = session.deepDiveRounds.filter(
    (r) => r.round < targetRound.round && r.aiResponse.trim().length > 0
  );

  const priorRoundsContext =
    priorRounds.length > 0
      ? priorRounds
          .map(
            (r) =>
              `Nhịp hỏi trước (#${r.round}): "${r.question}" -> ${formatCardContext(r.clarifierCard)}\nChia sẻ trước đó: ${r.aiResponse}`
          )
          .join('\n\n')
      : 'Chưa có nhịp hỏi bổ trợ trước đó.';

  return `
Bối cảnh trải bài ban đầu:
- Chủ đề: ${topicPreset.label}
- Băn khoăn gốc: "${session.question}"
- 3 lá bài nền tảng:
${initialCardsContext}

Mạch chia sẻ ban đầu:
${session.synthesisText || '(Tham chiếu trực tiếp từ 3 lá bài nền tảng)'}

Các nhịp hỏi sâu trước đó:
${priorRoundsContext}

---
Câu hỏi đào sâu mới của bạn: "${targetRound.question}"
Lá bài bổ trợ vừa rút được:
${formatCardContext(targetRound.clarifierCard)}

Hãy viết lời phản hồi chữa lành dài khoảng 160 – 230 chữ:
- Đi thẳng vào điều bạn vừa hỏi với giọng văn ấm áp, thủ thỉ và thấu cảm.
- Kết nối thông điệp của lá bài bổ trợ vừa rút với mạch câu chuyện từ 3 lá bài nền tảng để tháo gỡ nút thắt hoặc soi sáng một góc nhìn mới mẻ, nhẹ nhõm hơn.
- Có thể dùng 1 tiêu đề phụ ngắn (### ...) nếu cần tách ý, trình bày thành 2–3 đoạn văn ngắn giàu khoảng thở.
`.trim();
}