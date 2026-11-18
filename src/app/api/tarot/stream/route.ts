import dns from "node:dns";
import { GoogleGenAI } from "@google/genai";
import {
  AURAE_SYSTEM_INSTRUCTION,
  buildCumulativeDeepDivePrompt,
  buildSynthesisPrompt,
} from "@/features/tarot-reading/prompts/tarotPrompts";
import {
  tarotStreamRequestSchema,
  toNormalizedReadingSession,
} from "@/features/tarot-reading/schemas/tarotSchemas";
import type { DeepDiveRound } from "@/types/tarot";

// Ưu tiên IPv4 giúp khắc phục triệt để lỗi UND_ERR_CONNECT_TIMEOUT khi Node gọi Google API
dns.setDefaultResultOrder("ipv4first");

interface RateBucket {
  count: number;
  resetAt: number;
}

const minuteBuckets = new Map<string, RateBucket>();
const hourBuckets = new Map<string, RateBucket>();

const LIMIT_PER_MINUTE = 10;
const LIMIT_PER_HOUR = 45;

function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSec: number;
} {
  const now = Date.now();

  if (minuteBuckets.size > 500) {
    for (const [key, bucket] of minuteBuckets) {
      if (bucket.resetAt <= now) minuteBuckets.delete(key);
    }
  }
  if (hourBuckets.size > 500) {
    for (const [key, bucket] of hourBuckets) {
      if (bucket.resetAt <= now) hourBuckets.delete(key);
    }
  }

  let minBucket = minuteBuckets.get(ip);
  if (!minBucket || minBucket.resetAt <= now) {
    minBucket = { count: 0, resetAt: now + 60_000 };
    minuteBuckets.set(ip, minBucket);
  }
  if (minBucket.count >= LIMIT_PER_MINUTE) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((minBucket.resetAt - now) / 1000)),
    };
  }

  let hrBucket = hourBuckets.get(ip);
  if (!hrBucket || hrBucket.resetAt <= now) {
    hrBucket = { count: 0, resetAt: now + 3_600_000 };
    hourBuckets.set(ip, hrBucket);
  }
  if (hrBucket.count >= LIMIT_PER_HOUR) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((hrBucket.resetAt - now) / 1000)),
    };
  }

  minBucket.count += 1;
  hrBucket.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

function extractClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  return request.headers.get("x-real-ip")?.trim() || "local-client";
}

function getModelCandidates(): string[] {
  const envModel = process.env.GEMINI_MODEL?.trim();
  const defaults = [
    "gemini-3.8-flash",
    "gemini-3.5-flash-lite",
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite",
  ];

  if (!envModel) return defaults;
  return [envModel, ...defaults.filter((m) => m !== envModel)];
}

function getErrorInfo(error: unknown): {
  status?: number;
  message: string;
  causeCode?: string;
} {
  if (!error || typeof error !== "object") {
    return { message: String(error ?? "") };
  }
  const err = error as {
    status?: number;
    message?: string;
    cause?: { code?: string };
  };
  return {
    status: err.status,
    message: String(err.message ?? ""),
    causeCode: err.cause?.code,
  };
}

function isRetryableFailure(error: unknown): boolean {
  const { status, message, causeCode } = getErrorInfo(error);
  const msg = message.toLowerCase();

  // Lỗi model chưa khả dụng
  const isModelIssue =
    status === 404 ||
    msg.includes("not found") ||
    msg.includes("is not supported") ||
    msg.includes("deprecated") ||
    msg.includes("shut down");

  // Lỗi timeout kết nối mạng tạm thời (UND_ERR_CONNECT_TIMEOUT, fetch failed, 503)
  const isTransientNetwork =
    status === 503 ||
    status === 504 ||
    causeCode === "UND_ERR_CONNECT_TIMEOUT" ||
    causeCode === "ETIMEDOUT" ||
    causeCode === "ECONNRESET" ||
    msg.includes("fetch failed") ||
    msg.includes("timeout");

  return isModelIssue || isTransientNetwork;
}

function mapReadableGeminiError(error: unknown): {
  status: number;
  message: string;
} {
  const { status, message, causeCode } = getErrorInfo(error);
  const msg = message.toLowerCase();

  if (
    msg.includes("api_key_invalid") ||
    msg.includes("api key not valid") ||
    status === 401
  ) {
    return {
      status: 401,
      message:
        "GEMINI_API_KEY chưa hợp lệ. Vui lòng kiểm tra lại mã khóa trong file .env.local.",
    };
  }

  if (
    status === 429 ||
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource_exhausted")
  ) {
    return {
      status: 429,
      message:
        "Hệ thống đang chạm ngưỡng giới hạn lượt luận giải miễn phí. Vui lòng đợi khoảng 1 phút rồi thử lại.",
    };
  }

  if (
    causeCode === "UND_ERR_CONNECT_TIMEOUT" ||
    causeCode === "ETIMEDOUT" ||
    msg.includes("timeout")
  ) {
    return {
      status: 504,
      message:
        "Đường truyền tới máy chủ AI phản hồi chậm (Timeout). Vui lòng bấm Thử lại.",
    };
  }

  return {
    status: 502,
    message:
      "Kết nối với không gian luận giải tạm gián đoạn. Vui lòng kiểm tra mạng hoặc thử lại.",
  };
}

export async function POST(request: Request) {
  const clientIp = extractClientIp(request);
  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    return Response.json(
      {
        error: `Bạn đang thao tác hơi nhanh. Vui lòng đợi ${rateCheck.retryAfterSec} giây rồi thử lại.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfterSec) },
      },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { error: "Thiếu cấu hình GEMINI_API_KEY trên máy chủ." },
      { status: 500 },
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json(
      { error: "Định dạng JSON yêu cầu không hợp lệ." },
      { status: 400 },
    );
  }

  const validation = tarotStreamRequestSchema.safeParse(rawBody);
  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message;
    return Response.json(
      { error: firstError ?? "Dữ liệu đầu vào không hợp lệ." },
      { status: 400 },
    );
  }

  const payload = validation.data;
  const normalizedSession = toNormalizedReadingSession(payload.session);

  const userPrompt =
    payload.mode === "deep-dive"
      ? buildCumulativeDeepDivePrompt(
          normalizedSession,
          payload.targetRound as DeepDiveRound,
        )
      : buildSynthesisPrompt(normalizedSession);

  const maxOutputTokens = payload.mode === "deep-dive" ? 1800 : 2500;

  const ai = new GoogleGenAI({ apiKey });
  const candidates = getModelCandidates();

  let activeIterator: AsyncGenerator<{ text?: string }> | null = null;
  let firstTextChunk = "";
  let lastError: unknown = null;

  for (const modelName of candidates) {
    if (request.signal.aborted) {
      return new Response(null, { status: 499 });
    }

    try {
      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction: AURAE_SYSTEM_INSTRUCTION,
          temperature: 0.72,
          topP: 0.9,
          maxOutputTokens,
        },
      });

      const iterator = responseStream[Symbol.asyncIterator]();
      while (true) {
        const nextStep = await iterator.next();
        if (nextStep.done) {
          break;
        }
        const text = nextStep.value?.text ?? "";
        if (text) {
          firstTextChunk = text;
          activeIterator = iterator;
          break;
        }
      }

      if (activeIterator || firstTextChunk) {
        break;
      }
    } catch (error) {
      lastError = error;
      console.error(`[Gemini Stream] Model "${modelName}" failed:`, error);
      if (isRetryableFailure(error)) {
        continue;
      }
      break;
    }
  }

  if (!activeIterator && !firstTextChunk) {
    const mapped = mapReadableGeminiError(lastError);
    return Response.json({ error: mapped.message }, { status: mapped.status });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (firstTextChunk) {
          controller.enqueue(encoder.encode(firstTextChunk));
        }

        if (activeIterator) {
          while (true) {
            if (request.signal.aborted) {
              break;
            }
            const nextStep = await activeIterator.next();
            if (nextStep.done) {
              break;
            }
            const textPart = nextStep.value?.text;
            if (textPart) {
              controller.enqueue(encoder.encode(textPart));
            }
          }
        }
      } catch (streamError) {
        console.error("[Gemini Stream] Mid-stream interrupted:", streamError);
      } finally {
        try {
          controller.close();
        } catch {
          // Stream đã đóng trước đó
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
