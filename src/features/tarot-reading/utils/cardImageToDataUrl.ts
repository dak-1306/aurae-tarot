import { TAROT_CARD_MAP } from "@/constants/tarot-deck";
import type { ReadingSession } from "@/types/tarot";

const dataUrlCache = new Map<string, string>();
const inflightConversions = new Map<string, Promise<string | null>>();

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Không thể đọc dữ liệu ảnh Base64."));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Lỗi đọc Blob."));
    reader.readAsDataURL(blob);
  });
}

/**
 * Lấy ảnh lá bài qua API nội bộ cùng tên miền và mã hóa sang Base64 Data URL
 * để trình duyệt xuất PNG hiển thị 100% hình minh họa.
 */
export async function convertCardImageToDataUrl(
  cardId: string,
): Promise<string | null> {
  const cached = dataUrlCache.get(cardId);
  if (cached) return cached;

  if (!TAROT_CARD_MAP[cardId] || typeof window === "undefined") {
    return null;
  }

  let pending = inflightConversions.get(cardId);
  if (!pending) {
    pending = (async () => {
      try {
        const proxyUrl = `/api/tarot/card-image?cardId=${encodeURIComponent(cardId)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) return null;

        const blob = await response.blob();
        const dataUrl = await blobToDataUrl(blob);
        dataUrlCache.set(cardId, dataUrl);
        return dataUrl;
      } catch {
        return null;
      } finally {
        inflightConversions.delete(cardId);
      }
    })();

    inflightConversions.set(cardId, pending);
  }

  return pending;
}

/**
 * Chuẩn bị sẵn bản đồ Data URL cho toàn bộ lá bài chính & lá bài bổ trợ trong phiên.
 */
export async function prepareSessionCardDataUrls(
  session: ReadingSession,
): Promise<Record<string, string>> {
  const cardIds = new Set<string>([
    ...session.initialCards.map((c) => c.cardId),
    ...session.deepDiveRounds.map((r) => r.clarifierCard.cardId),
  ]);

  const entries = await Promise.all(
    Array.from(cardIds).map(async (cardId) => {
      const dataUrl = await convertCardImageToDataUrl(cardId);
      return [cardId, dataUrl] as const;
    }),
  );

  const result: Record<string, string> = {};
  for (const [cardId, dataUrl] of entries) {
    if (dataUrl) {
      result[cardId] = dataUrl;
    }
  }
  return result;
}
