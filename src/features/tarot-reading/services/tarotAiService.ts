import { TAROT_CONFIG, TOPIC_PRESETS, UI_TEXTS } from "@/constants/app";
import { TAROT_CARD_MAP } from "@/constants/tarot-deck";
import type { DeepDiveRound, DrawnCard, ReadingSession } from "@/types/tarot";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function formatCardDescriptor(drawn: DrawnCard): {
  title: string;
  orientationLabel: string;
  meaning: string;
  keywords: string;
} {
  const def = TAROT_CARD_MAP[drawn.cardId];
  if (!def) {
    return {
      title: drawn.cardId,
      orientationLabel: UI_TEXTS.ORIENTATION.UPRIGHT,
      meaning: "",
      keywords: "",
    };
  }

  const isReversed = drawn.orientation === "reversed";
  return {
    title: `${def.nameVi} (${def.nameEn})`,
    orientationLabel: isReversed
      ? UI_TEXTS.ORIENTATION.REVERSED
      : UI_TEXTS.ORIENTATION.UPRIGHT,
    meaning: isReversed ? def.meaningReversed : def.meaningUpright,
    keywords: (isReversed ? def.keywordsReversed : def.keywordsUpright).join(
      ", ",
    ),
  };
}

function buildSynthesisNarrative(session: ReadingSession): string {
  const topic = TOPIC_PRESETS[session.topicId];
  const [first, second, third] = session.initialCards;

  const card1 = formatCardDescriptor(first);
  const card2 = formatCardDescriptor(second);
  const card3 = formatCardDescriptor(third);

  return [
    `Với tâm ý "${session.question}" thuộc lĩnh vực ${topic.label}, trải bài mở ra một dòng chảy năng lượng rõ nét qua ba điểm chạm cốt lõi.`,
    ``,
    `1. ${first.positionLabel} — ${card1.title} [${card1.orientationLabel}]`,
    `Nền tảng của câu chuyện bắt đầu từ trường năng lượng của ${card1.keywords.toLowerCase()}. ${card1.meaning} Điều này lý giải vì sao tâm trí bạn đang đứng trước những chuyển động hiện tại.`,
    ``,
    `2. ${second.positionLabel} — ${card2.title} [${card2.orientationLabel}]`,
    `Ở trọng tâm hiện tại, lá bài nhấn mạnh vào sắc thái ${card2.keywords.toLowerCase()}. ${card2.meaning} Đây chính là nút thắt quan trọng nhất đòi hỏi sự tỉnh táo và chân thành với chính mình.`,
    ``,
    `3. ${third.positionLabel} — ${card3.title} [${card3.orientationLabel}]`,
    `Khi bạn giữ vững sự cân bằng trước hai năng lượng trên, hướng mở ra phía trước mang thông điệp của ${card3.keywords.toLowerCase()}. ${card3.meaning}`,
    ``,
    `Thông điệp tổng hòa: Sự kết nối giữa ${card1.title} và ${card3.title} cho thấy chuyển biến lớn nhất không nằm ở việc kiểm soát hoàn cảnh bên ngoài, mà ở cách bạn điều chỉnh góc nhìn và nhịp hành động ngay trong hiện tại.`,
  ].join("\n");
}

function buildDeepDiveNarrative(
  session: ReadingSession,
  currentRound: DeepDiveRound,
): string {
  const clarifier = formatCardDescriptor(currentRound.clarifierCard);
  const coreNames = session.initialCards
    .map((c) => TAROT_CARD_MAP[c.cardId]?.nameVi ?? c.cardId)
    .join(" – ");

  const previousRoundsContext = session.deepDiveRounds
    .filter((r) => r.round < currentRound.round)
    .map((r) => {
      const prevCard =
        TAROT_CARD_MAP[r.clarifierCard.cardId]?.nameVi ??
        r.clarifierCard.cardId;
      return `Vòng ${r.round} (${prevCard})`;
    })
    .join(", ");

  const continuityNote = previousRoundsContext
    ? `Tiếp nối mạch năng lượng từ 3 lá chủ đạo (${coreNames}) cùng ${previousRoundsContext}, `
    : `Đặt trong sự đối chiếu trực tiếp với bộ ba lá chủ đạo (${coreNames}), `;

  return [
    `${continuityNote}lá bài bổ trợ #${currentRound.round} xuất hiện cho câu hỏi "${currentRound.question}" là ${clarifier.title} [${clarifier.orientationLabel}].`,
    ``,
    `Trường năng lượng ${clarifier.keywords.toLowerCase()} làm sáng tỏ một góc khuất tinh tế: ${clarifier.meaning}`,
    ``,
    `Gợi ý ứng dụng trực tiếp: Thay vì phân tán sự chú ý sang nhiều kịch bản cùng lúc, hãy lấy từ khóa "${clarifier.keywords.split(",")[0]?.trim() ?? clarifier.title}" làm kim chỉ nam cho bước đi tiếp theo của bạn.`,
  ].join("\n");
}

async function* streamTextByTokens(
  fullText: string,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  const tokens = fullText.split(/(\s+)/);
  for (const token of tokens) {
    if (signal?.aborted) {
      return;
    }
    yield token;
    if (token.trim().length > 0) {
      await sleep(TAROT_CONFIG.STREAM_CHUNK_DELAY_MS);
    }
  }
}

/**
 * Luận giải tổng quan 3 lá bài đầu tiên (Step 5).
 */
export async function* streamInitialSynthesis(
  session: ReadingSession,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  const narrative = buildSynthesisNarrative(session);
  yield* streamTextByTokens(narrative, signal);
}

/**
 * Luận giải đào sâu nối tiếp (Step 6 - tối đa 3 vòng, giữ nguyên ngữ cảnh 3 lá gốc + các lá bổ trợ trước đó).
 */
export async function* streamCumulativeDeepDive(
  session: ReadingSession,
  currentRound: DeepDiveRound,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  const narrative = buildDeepDiveNarrative(session, currentRound);
  yield* streamTextByTokens(narrative, signal);
}
