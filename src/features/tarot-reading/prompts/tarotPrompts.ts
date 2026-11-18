import { TOPIC_PRESETS } from "@/constants/app";
import { TAROT_CARD_MAP } from "@/constants/tarot-deck";
import type { DeepDiveRound, DrawnCard, ReadingSession } from "@/types/tarot";

export const AURAE_SYSTEM_INSTRUCTION = `
Bạn là người dẫn giải của aurae — một không gian chiêm nghiệm Tarot mang phong cách biên tập (editorial) hiện đại, điềm tĩnh và sâu sắc.

NGUYÊN TẮC GIỌNG VĂN & PHONG CÁCH:
- Ngôn ngữ: Tiếng Việt chuẩn mực, giàu tính chiêm nghiệm, ấm áp nhưng tỉnh táo và khách quan (xưng "bạn").
- Tuyệt đối KHÔNG dùng văn phong mê tín, bói toán sến súa, kịch tính hóa định mệnh (tránh các cụm như "vũ trụ gửi thông điệp", "thầy phán", "định mệnh an bài", "chúc bạn may mắn").
- Không dùng emoji. Không mở đầu bằng lời chào xã giao hay lặp lại nguyên văn câu hỏi một cách máy móc.
- Luận giải phải bám sát biểu tượng của lá bài, chiều Xuôi/Ngược, vị trí trải bài và bối cảnh thực tế trong câu hỏi của người dùng.
- Giữ định dạng Markdown sạch sẽ, dễ đọc trên cả điện thoại lẫn máy tính.
`.trim();

function formatCardDetail(card: DrawnCard): string {
  const def = TAROT_CARD_MAP[card.cardId];
  if (!def) {
    return `- Vị trí [${card.positionLabel}]: ${card.cardId} (${card.orientation === "reversed" ? "Ngược" : "Xuôi"})`;
  }

  const isReversed = card.orientation === "reversed";
  const orientationLabel = isReversed ? "Ngược (Reversed)" : "Xuôi (Upright)";
  const keywords = (
    isReversed ? def.keywordsReversed : def.keywordsUpright
  ).join(", ");
  const coreMeaning = isReversed ? def.meaningReversed : def.meaningUpright;

  return [
    `- Vị trí [${card.positionLabel}]: **${def.nameVi} (${def.nameEn})** — Trạng thái: ${orientationLabel}`,
    `  + Từ khóa: ${keywords}`,
    `  + Tầng nghĩa gốc: ${coreMeaning}`,
  ].join("\n");
}

export function buildSynthesisPrompt(session: ReadingSession): string {
  const topicPreset = TOPIC_PRESETS[session.topicId] ?? TOPIC_PRESETS.general;
  const cardsBlock = session.initialCards.map(formatCardDetail).join("\n");

  return `
CHỦ ĐỀ TRẢI BÀI: ${topicPreset.label}
Ý NIỆM / CÂU HỎI CỦA NGƯỜI DÙNG: "${session.question}"

BA LÁ BÀI ĐÃ RÚT:
${cardsBlock}

YÊU CẦU CẤU TRÚC LUẬN GIẢI (khoảng 250 - 340 chữ, súc tích, giàu khoảng thở):
### Mạch kết nối tổng quan
1 đoạn ngắn (2 câu) tóm lược bức tranh chung và sự chuyển dịch năng lượng qua 3 lá bài.

### Soi chiếu từng vị trí
Dùng gạch đầu dòng cho từng vị trí (${session.initialCards.map((c) => c.positionLabel).join(" / ")}), mỗi ý gói gọn trong 2-3 câu sắc nét, gắn trực tiếp biểu tượng lá bài với câu hỏi của bạn.

### Điểm tựa chiêm nghiệm
1 đoạn ngắn (2 câu) gợi mở góc nhìn hoặc hành động thực tế giúp bạn chủ động bước tiếp.
`.trim();
}

export function buildCumulativeDeepDivePrompt(
  session: ReadingSession,
  targetRound: DeepDiveRound,
): string {
  const topicPreset = TOPIC_PRESETS[session.topicId] ?? TOPIC_PRESETS.general;
  const initialCardsBlock = session.initialCards
    .map(formatCardDetail)
    .join("\n");

  const priorRounds = session.deepDiveRounds.filter(
    (r) => r.round < targetRound.round && r.aiResponse.trim().length > 0,
  );

  const priorRoundsBlock =
    priorRounds.length > 0
      ? priorRounds
          .map(
            (r) =>
              `Vòng hỏi bổ trợ #${r.round}:\n- Câu hỏi: "${r.question}"\n- Lá bổ trợ: ${formatCardDetail(r.clarifierCard)}\n- Luận giải trước đó: ${r.aiResponse}`,
          )
          .join("\n\n")
      : "Chưa có vòng hỏi bổ trợ trước đó.";

  return `
NGỮ CẢNH TRẢI BÀI GỐC:
- Chủ đề: ${topicPreset.label}
- Câu hỏi ban đầu: "${session.question}"
- 3 lá bài nền tảng:
${initialCardsBlock}

TÓM TẮT LUẬN GIẢI BAN ĐẦU:
${session.synthesisText || "(Đang tham chiếu trực tiếp từ 3 lá bài nền tảng)"}

LỊCH SỬ CÁC VÒNG HỎI SÂU TRƯỚC ĐÓ:
${priorRoundsBlock}

---
LƯỢT HỎI SÂU MỚI (VÒNG #${targetRound.round}):
- Câu hỏi đào sâu mới của người dùng: "${targetRound.question}"
- Lá bài bổ trợ vừa rút được:
${formatCardDetail(targetRound.clarifierCard)}

YÊU CẦU PHẢN HỒI (khoảng 180 - 260 chữ):
- Trả lời thẳng vào câu hỏi đào sâu mới bằng cách kết nối ý nghĩa của **lá bài bổ trợ vừa rút** với mạch câu chuyện của 3 lá bài nền tảng (và vòng trước nếu có).
- Không lặp lại phần giải thích dài dòng của trải bài ban đầu; tập trung làm rõ nút thắt, góc nhìn mới hoặc hành động cụ thể cho câu hỏi này.
`.trim();
}
