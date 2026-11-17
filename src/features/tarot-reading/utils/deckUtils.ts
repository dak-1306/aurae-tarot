import { TAROT_CONFIG, TOPIC_PRESETS } from "@/constants/app";
import { TAROT_DECK } from "@/constants/tarot-deck";
import type {
  CardOrientation,
  DeepDiveRoundNumber,
  DrawnCard,
  FanCardItem,
  TarotCardDefinition,
  TopicId,
} from "@/types/tarot";

/**
 * Xào bộ bài bằng thuật toán Fisher-Yates chuẩn (thuần túy, không mutate mảng gốc).
 */
export function shuffleDeck(
  deck: readonly TarotCardDefinition[] = TAROT_DECK,
  randomFn: () => number = Math.random,
): TarotCardDefinition[] {
  const copy = [...deck];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomFn() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/**
 * Xác định chiều lá bài (Xuôi / Ngược) dựa trên cấu hình phiên trải bài.
 */
export function resolveCardOrientation(
  allowReversed: boolean,
  randomFn: () => number = Math.random,
): CardOrientation {
  if (!allowReversed) {
    return "upright";
  }
  return randomFn() < TAROT_CONFIG.REVERSED_PROBABILITY
    ? "reversed"
    : "upright";
}

/**
 * Tạo dàn bài úp xòe hình quạt (Fan Pool) đã xào ngẫu nhiên để người dùng tự tay chọn lá.
 */
export function createShuffledFanPool(
  count: number,
  allowReversed: boolean,
  excludedCardIds: ReadonlySet<string> = new Set(),
  randomFn: () => number = Math.random,
): FanCardItem[] {
  const availableCards = TAROT_DECK.filter(
    (card) => !excludedCardIds.has(card.id),
  );
  const shuffled = shuffleDeck(availableCards, randomFn);

  return shuffled.slice(0, count).map((card, index) => ({
    fanId: `fan_${index}_${card.id}`,
    cardId: card.id,
    orientation: resolveCardOrientation(allowReversed, randomFn),
    isPicked: false,
  }));
}

/**
 * Xử lý khi người dùng tự tay rút 1 lá từ dàn quạt vào 3 ô vị trí chính.
 * Khởi tạo với isRevealed = false để kích hoạt hiệu ứng lật bài 3D ngay sau khi vào ô.
 */
export function pickInitialCardFromFanPool(
  fanPool: readonly FanCardItem[],
  currentInitialCards: readonly DrawnCard[],
  targetFanId: string,
  topicId: TopicId,
): {
  readonly updatedFanPool: FanCardItem[];
  readonly updatedInitialCards: DrawnCard[];
  readonly pickedPositionIndex: number;
} | null {
  if (currentInitialCards.length >= TAROT_CONFIG.INITIAL_DRAW_COUNT) {
    return null;
  }

  const pickedItem = fanPool.find(
    (item) => item.fanId === targetFanId && !item.isPicked,
  );
  if (!pickedItem) {
    return null;
  }

  const nextIndex = currentInitialCards.length;
  const positions = TOPIC_PRESETS[topicId].spreadPositions;

  const newDrawnCard: DrawnCard = {
    cardId: pickedItem.cardId,
    positionIndex: nextIndex,
    positionLabel: positions[nextIndex] ?? positions[0],
    orientation: pickedItem.orientation,
    isRevealed: false,
    isClarifier: false,
  };

  const updatedFanPool = fanPool.map((item) =>
    item.fanId === targetFanId ? { ...item, isPicked: true } : item,
  );

  return {
    updatedFanPool,
    updatedInitialCards: [...currentInitialCards, newDrawnCard],
    pickedPositionIndex: nextIndex,
  };
}

/**
 * Xử lý khi người dùng tự tay rút 1 lá bổ trợ từ bộ bài phụ ở bước Đào Sâu.
 */
export function pickClarifierCardFromFanPool(
  clarifierFanPool: readonly FanCardItem[],
  targetFanId: string,
  round: DeepDiveRoundNumber,
  question: string,
): DrawnCard | null {
  const pickedItem = clarifierFanPool.find(
    (item) => item.fanId === targetFanId && !item.isPicked,
  );
  if (!pickedItem) {
    return null;
  }

  const trimmedQuestion = question.trim();
  const shortLabel =
    trimmedQuestion.length > 36
      ? `${trimmedQuestion.slice(0, 36)}...`
      : trimmedQuestion;

  return {
    cardId: pickedItem.cardId,
    positionIndex: TAROT_CONFIG.INITIAL_DRAW_COUNT + round - 1,
    positionLabel: shortLabel,
    orientation: pickedItem.orientation,
    isRevealed: true,
    isClarifier: true,
    clarifierRound: round,
  };
}

/**
 * Chuyển đổi số thứ tự Major Arcana sang chữ số La Mã chuẩn Tarot.
 */
export function toRomanNumeral(num: number): string {
  if (num === 0) return "0";
  const lookup: ReadonlyArray<readonly [string, number]> = [
    ["XX", 20],
    ["X", 10],
    ["IX", 9],
    ["V", 5],
    ["IV", 4],
    ["I", 1],
  ];
  let remaining = num;
  let result = "";
  for (const [roman, value] of lookup) {
    while (remaining >= value) {
      result += roman;
      remaining -= value;
    }
  }
  return result;
}
