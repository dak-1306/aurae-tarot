import dns from 'node:dns';
import { GoogleGenAI } from '@google/genai';
import { TAROT_CONFIG } from '@/constants/app';
import {
  AURAE_SYSTEM_INSTRUCTION,
  buildCumulativeDeepDivePrompt,
  buildSynthesisPrompt,
} from '@/features/tarot-reading/prompts/tarotPrompts';
import {
  tarotStreamRequestSchema,
  toNormalizedReadingSession,
} from '@/features/tarot-reading/schemas/tarotSchemas';
import type { DeepDiveRound } from '@/types/tarot';

dns.setDefaultResultOrder('ipv4first');

interface RateBucket {
  count: number;
  resetAt: number;
}

const minuteBuckets = new Map<string, RateBucket>();
const hourBuckets = new Map<string, RateBucket>();

const LIMIT_PER_MINUTE = 10;
const LIMIT_PER_HOUR = 45;

// Cache model đã kết nối thành công trong RAM để các lượt sau phản hồi tức thì
let cachedWorkingModel: string | null = null;

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
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
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }
  return request.headers.get('x-real-ip')?.trim() || 'local-client';
}

function getInitialModelCandidates(): string[] {
  const envModel = process.env.GEMINI_MODEL?.trim();
  const baseList = [
    cachedWorkingModel,
    envModel,
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite-preview',
    'gemini-3-flash',
  ].filter((m): m is string => Boolean(m));

  return Array.from(new Set(baseList));
}

/**
 * Tự động dò danh sách model Flash đang khả dụng trên API Key của người dùng
 * nếu các tên mặc định gặp 404.
 */
async function discoverAvailableFlashModels(ai: GoogleGenAI): Promise<string[]> {
  try {
    const pager = await ai.models.list();
    const discovered: string[] = [];

    for await (const model of pager) {
      const rawName = (model.name ?? '').replace(/^models\//, '');
      if (!rawName || !rawName.includes('flash')) continue;

      // Loại bỏ các model chuyên biệt không dùng để sinh văn bản thuần
      if (
        rawName.includes('image') ||
        rawName.includes('audio') ||
        rawName.includes('tts') ||
        rawName.includes('live') ||
        rawName.includes('embedding') ||
        rawName.includes('robotics') ||
        rawName.includes('computer-use')
      ) {
        continue;
      }

      const extendedModel = model as {
        supportedActions?: string[];
        supportedGenerationMethods?: string[];
      };
      const actions =
        extendedModel.supportedActions ??
        extendedModel.supportedGenerationMethods;

      if (Array.isArray(actions) && !actions.includes('generateContent')) {
        continue;
      }

      discovered.push(rawName);
    }

    // Ưu tiên phiên bản số lớn hơn (3.1 > 3 > 2.5...) và ưu tiên bản Flash tiêu chuẩn trước Lite
    return discovered.sort((a, b) => {
      const versionA = parseFloat(/gemini-(\d+(?:\.\d+)?)/.exec(a)?.[1] ?? '0');
      const versionB = parseFloat(/gemini-(\d+(?:\.\d+)?)/.exec(b)?.[1] ?? '0');
      if (versionB !== versionA) return versionB - versionA;

      const isLiteA = a.includes('lite') ? 1 : 0;
      const isLiteB = b.includes('lite') ? 1 : 0;
      return isLiteA - isLiteB;
    });
  } catch (err) {
    console.error('[Gemini Stream] Failed to list available models:', err);
    return [];
  }
}

function getErrorInfo(error: unknown): {
  status?: number;
  message: string;
  causeCode?: string;
} {
  if (!error || typeof error !== 'object') {
    return { message: String(error ?? '') };
  }
  const err = error as {
    status?: number;
    message?: string;
    cause?: { code?: string };
  };
  return {
    status: err.status,
    message: String(err.message ?? ''),
    causeCode: err.cause?.code,
  };
}

function isModelNotFoundError(error: unknown): boolean {
  const { status, message } = getErrorInfo(error);
  const msg = message.toLowerCase();
  return (
    status === 404 ||
    msg.includes('not found') ||
    msg.includes('is not supported') ||
    msg.includes('deprecated')
  );
}

function isThinkingParamError(error: unknown): boolean {
  const { status, message } = getErrorInfo(error);
  const msg = message.toLowerCase();
  return (
    status === 400 &&
    (msg.includes('thinking') || msg.includes('budget') || msg.includes('config'))
  );
}

function isTransientNetworkError(error: unknown): boolean {
  const { status, message, causeCode } = getErrorInfo(error);
  const msg = message.toLowerCase();
  return (
    status === 503 ||
    status === 504 ||
    causeCode === 'UND_ERR_CONNECT_TIMEOUT' ||
    causeCode === 'ETIMEDOUT' ||
    causeCode === 'ECONNRESET' ||
    msg.includes('fetch failed') ||
    msg.includes('timeout')
  );
}

function mapReadableGeminiError(error: unknown): {
  status: number;
  message: string;
} {
  const { status, message, causeCode } = getErrorInfo(error);
  const msg = message.toLowerCase();

  if (
    msg.includes('api_key_invalid') ||
    msg.includes('api key not valid') ||
    status === 401
  ) {
    return {
      status: 401,
      message:
        'GEMINI_API_KEY chưa hợp lệ. Vui lòng kiểm tra lại mã khóa trong file .env.local.',
    };
  }

  if (
    status === 429 ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('resource_exhausted')
  ) {
    return {
      status: 429,
      message:
        'Hệ thống đang chạm ngưỡng giới hạn lượt luận giải miễn phí. Vui lòng đợi khoảng 1 phút rồi thử lại.',
    };
  }

  if (
    causeCode === 'UND_ERR_CONNECT_TIMEOUT' ||
    causeCode === 'ETIMEDOUT' ||
    msg.includes('timeout')
  ) {
    return {
      status: 504,
      message:
        'Đường truyền tới máy chủ AI phản hồi chậm (Timeout). Vui lòng bấm Thử lại.',
    };
  }

  return {
    status: 502,
    message:
      'Kết nối với không gian luận giải tạm gián đoạn. Vui lòng kiểm tra mạng hoặc thử lại.',
  };
}

async function openGeminiStreamForModel(
  ai: GoogleGenAI,
  modelName: string,
  userPrompt: string,
  maxOutputTokens: number,
  disableThinking: boolean
): Promise<{
  firstTextChunk: string;
  iterator: AsyncGenerator<{ text?: string }>;
} | null> {
  const responseStream = await ai.models.generateContentStream({
    model: modelName,
    contents: userPrompt,
    config: {
      systemInstruction: AURAE_SYSTEM_INSTRUCTION,
      temperature: 0.78,
      topP: 0.92,
      maxOutputTokens,
      ...(disableThinking ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
    },
  });

  const iterator = responseStream[Symbol.asyncIterator]();
  while (true) {
    const nextStep = await iterator.next();
    if (nextStep.done) {
      return null;
    }
    const text = nextStep.value?.text ?? '';
    if (text) {
      return { firstTextChunk: text, iterator };
    }
  }
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
        headers: { 'Retry-After': String(rateCheck.retryAfterSec) },
      }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { error: 'Thiếu cấu hình GEMINI_API_KEY trên máy chủ.' },
      { status: 500 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return Response.json(
      { error: 'Định dạng JSON yêu cầu không hợp lệ.' },
      { status: 400 }
    );
  }

  const validation = tarotStreamRequestSchema.safeParse(rawBody);
  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message;
    return Response.json(
      { error: firstError ?? 'Dữ liệu đầu vào không hợp lệ.' },
      { status: 400 }
    );
  }

  const payload = validation.data;
  const normalizedSession = toNormalizedReadingSession(payload.session);

  let userPrompt: string;
  let maxOutputTokens: number;

  if (payload.mode === 'deep-dive') {
    const targetRound = payload.targetRound as DeepDiveRound;
    const shouldGenerateSuggestions =
      targetRound.round < TAROT_CONFIG.MAX_DEEP_DIVE_ROUNDS;

    userPrompt = buildCumulativeDeepDivePrompt(
      normalizedSession,
      targetRound,
      shouldGenerateSuggestions
    );
    maxOutputTokens = shouldGenerateSuggestions ? 1150 : 1000;
  } else {
    userPrompt = buildSynthesisPrompt(normalizedSession);
    maxOutputTokens = 1550;
  }

  // Bắt buộc dùng nhánh v1beta để hỗ trợ đầy đủ các model Gemini 3 & preview mới nhất
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { apiVersion: 'v1beta' },
  });

  const triedModels = new Set<string>();
  const candidateQueue = getInitialModelCandidates();

  let activeIterator: AsyncGenerator<{ text?: string }> | null = null;
  let firstTextChunk = '';
  let lastError: unknown = null;
  let hasDiscoveredModels = false;

  while (candidateQueue.length > 0) {
    if (request.signal.aborted) {
      return new Response(null, { status: 499 });
    }

    const modelName = candidateQueue.shift()!;
    if (triedModels.has(modelName)) continue;
    triedModels.add(modelName);

    try {
      const opened = await openGeminiStreamForModel(
        ai,
        modelName,
        userPrompt,
        maxOutputTokens,
        true
      );
      if (opened) {
        cachedWorkingModel = modelName;
        firstTextChunk = opened.firstTextChunk;
        activeIterator = opened.iterator;
        break;
      }
    } catch (error) {
      lastError = error;

      // Nếu model không hỗ trợ thinkingBudget: 0 (lỗi 400), thử lại ngay với config tiêu chuẩn
      if (isThinkingParamError(error)) {
        try {
          const fallbackOpened = await openGeminiStreamForModel(
            ai,
            modelName,
            userPrompt,
            maxOutputTokens,
            false
          );
          if (fallbackOpened) {
            cachedWorkingModel = modelName;
            firstTextChunk = fallbackOpened.firstTextChunk;
            activeIterator = fallbackOpened.iterator;
            break;
          }
        } catch (retryError) {
          lastError = retryError;
        }
      }

      if (cachedWorkingModel === modelName) {
        cachedWorkingModel = null;
      }

      console.error(`[Gemini Stream] Model "${modelName}" failed:`, error);

      // Nếu tất cả ứng viên tĩnh bị 404, tự động lấy danh sách model thật từ API Key
      if (
        candidateQueue.length === 0 &&
        !hasDiscoveredModels &&
        isModelNotFoundError(lastError)
      ) {
        hasDiscoveredModels = true;
        const discovered = await discoverAvailableFlashModels(ai);
        for (const found of discovered) {
          if (!triedModels.has(found)) {
            candidateQueue.push(found);
          }
        }
      }

      if (
        isModelNotFoundError(lastError) ||
        isTransientNetworkError(lastError)
      ) {
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
        console.error('[Gemini Stream] Mid-stream interrupted:', streamError);
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
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}