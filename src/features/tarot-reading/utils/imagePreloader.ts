import { TAROT_CARD_MAP } from "@/constants/tarot-deck";

const decodedUrls = new Set<string>();
const inflightPreloads = new Map<string, Promise<boolean>>();

/**
 * Kiểm tra đồng bộ xem ảnh của lá bài đã được tải & giải mã sẵn trong RAM chưa.
 */
export function isCardImageReady(cardId: string): boolean {
  const url = TAROT_CARD_MAP[cardId]?.imageUrl;
  return Boolean(url && decodedUrls.has(url));
}

/**
 * Tải ảnh và gọi img.decode() để giải mã sẵn bitmap vào bộ nhớ trước khi lật bài.
 */
export function preloadImageUrl(
  url: string,
  timeoutMs = 3000,
): Promise<boolean> {
  if (!url || typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (decodedUrls.has(url)) {
    return Promise.resolve(true);
  }

  let loadPromise = inflightPreloads.get(url);

  if (!loadPromise) {
    loadPromise = new Promise<boolean>((resolve) => {
      const img = new window.Image();
      img.decoding = "async";

      const handleSuccess = () => {
        if (typeof img.decode === "function") {
          img
            .decode()
            .catch(() => undefined)
            .finally(() => {
              decodedUrls.add(url);
              inflightPreloads.delete(url);
              resolve(true);
            });
        } else {
          decodedUrls.add(url);
          inflightPreloads.delete(url);
          resolve(true);
        }
      };

      const handleError = () => {
        inflightPreloads.delete(url);
        resolve(false);
      };

      img.onload = handleSuccess;
      img.onerror = handleError;
      img.src = url;
    });

    inflightPreloads.set(url, loadPromise);
  }

  return Promise.race([
    loadPromise,
    new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(decodedUrls.has(url)), timeoutMs);
    }),
  ]);
}

/**
 * Ưu tiên tải trước 1 lá bài cụ thể (dùng khi hover hoặc ngay lúc bấm rút).
 */
export function preloadCardImageById(
  cardId: string,
  timeoutMs = 1400,
): Promise<boolean> {
  const url = TAROT_CARD_MAP[cardId]?.imageUrl;
  if (!url) return Promise.resolve(false);
  return preloadImageUrl(url, timeoutMs);
}

/**
 * Tải ngầm danh sách lá bài theo từng cụm nhỏ để không làm nghẽn băng thông.
 */
export async function preloadCardsInBatches(
  cardIds: readonly string[],
  options?: {
    readonly batchSize?: number;
    readonly signal?: AbortSignal;
  },
): Promise<void> {
  const batchSize = options?.batchSize ?? 10;
  const signal = options?.signal;

  const uniqueCardIds = Array.from(new Set(cardIds)).filter(
    (id) => !isCardImageReady(id),
  );

  for (let i = 0; i < uniqueCardIds.length; i += batchSize) {
    if (signal?.aborted) return;

    const batch = uniqueCardIds.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map((cardId) => preloadCardImageById(cardId, 4000)),
    );
  }
}
