import {
  tarotStreamRequestSchema,
  type ValidatedApiSession,
} from "@/features/tarot-reading/schemas/tarotSchemas";
import type { DeepDiveRound, ReadingSession } from "@/types/tarot";

const STREAM_ENDPOINT = "/api/tarot/stream";

function serializeSessionForApi(session: ReadingSession): ValidatedApiSession {
  return {
    id: session.id,
    topicId: session.topicId,
    question: session.question.trim(),
    allowReversed: session.allowReversed,
    step: session.step,
    initialCards: [...session.initialCards],
    synthesisText: session.synthesisText,
    deepDiveRounds: session.deepDiveRounds.map((round) => ({
      ...round,
      question: round.question.trim(),
    })),
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

async function* consumeTarotTextStream(
  rawPayload: unknown,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  const parsed = tarotStreamRequestSchema.safeParse(rawPayload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message;
    throw new Error(firstIssue ?? "Dữ liệu trải bài không hợp lệ.");
  }

  const response = await fetch(STREAM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsed.data),
    signal,
  });

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}`;
    try {
      const errJson = (await response.json()) as { error?: string };
      if (errJson.error) {
        errorDetail = errJson.error;
      }
    } catch {
      // Bỏ qua nếu response lỗi không phải JSON
    }
    throw new Error(errorDetail);
  }

  if (!response.body) {
    throw new Error("Trình duyệt không hỗ trợ đọc luồng phản hồi.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        return;
      }

      const { done, value } = await reader.read();
      if (done) {
        const remaining = decoder.decode();
        if (remaining) {
          yield remaining;
        }
        break;
      }

      if (value) {
        const textChunk = decoder.decode(value, { stream: true });
        if (textChunk) {
          yield textChunk;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function* streamInitialSynthesis(
  session: ReadingSession,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  yield* consumeTarotTextStream(
    {
      mode: "synthesis",
      session: serializeSessionForApi(session),
    },
    signal,
  );
}

export async function* streamCumulativeDeepDive(
  sessionSnapshot: ReadingSession,
  targetRound: DeepDiveRound,
  signal?: AbortSignal,
): AsyncGenerator<string, void, unknown> {
  yield* consumeTarotTextStream(
    {
      mode: "deep-dive",
      session: serializeSessionForApi(sessionSnapshot),
      targetRound: {
        ...targetRound,
        question: targetRound.question.trim(),
      },
    },
    signal,
  );
}
