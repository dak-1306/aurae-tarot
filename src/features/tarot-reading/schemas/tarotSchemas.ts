import { z } from "zod";
import { TAROT_CARD_MAP } from "@/constants/tarot-deck";
import type { DeepDiveRound, ReadingSession } from "@/types/tarot";

export const topicIdSchema = z.enum([
  "love",
  "career",
  "finance",
  "self",
  "general",
  "crossroads",
]);

export const orientationSchema = z.enum(["upright", "reversed"]);

export const deepDiveRoundNumberSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

/**
 * Schema kiểm tra Form đặt ý niệm ban đầu (dùng được ngay tại StepIntention)
 */
export const intentionFormSchema = z.object({
  topicId: topicIdSchema,
  question: z
    .string()
    .trim()
    .min(4, "Câu hỏi cần ít nhất 4 ký tự để luận giải rõ nghĩa.")
    .max(500, "Câu hỏi tối đa 500 ký tự để giữ trọng tâm ý niệm."),
  allowReversed: z.boolean(),
});

/**
 * Schema kiểm tra Form hỏi đào sâu
 */
export const deepDiveQuestionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(4, "Câu hỏi bổ trợ cần ít nhất 4 ký tự.")
    .max(400, "Câu hỏi bổ trợ tối đa 400 ký tự."),
});

/**
 * Schema kiểm tra từng lá bài gửi lên API (đảm bảo cardId có thật trong bộ 78 lá)
 */
export const drawnCardSchema = z.object({
  cardId: z
    .string()
    .min(1)
    .refine((id) => Boolean(TAROT_CARD_MAP[id]), {
      message: "Mã lá bài không tồn tại trong bộ bài.",
    }),
  positionIndex: z.number().int().min(0).max(10),
  positionLabel: z.string().trim().min(1).max(60),
  orientation: orientationSchema,
  isRevealed: z.boolean(),
  isClarifier: z.boolean(),
  clarifierRound: deepDiveRoundNumberSchema.optional(),
});

export const deepDiveRoundSchema = z.object({
  round: deepDiveRoundNumberSchema,
  question: deepDiveQuestionSchema.shape.question,
  clarifierCard: drawnCardSchema,
  aiResponse: z.string().max(8000),
  createdAt: z.string(),
});

export const apiSessionSchema = z.object({
  id: z.string().min(1),
  topicId: topicIdSchema,
  question: intentionFormSchema.shape.question,
  allowReversed: z.boolean(),
  step: z.enum([
    "intention",
    "breathing",
    "shuffling",
    "drawing",
    "synthesis",
    "deep-dive",
    "closure",
  ]),
  initialCards: z.array(drawnCardSchema).min(1).max(3),
  synthesisText: z.string().max(12000),
  deepDiveRounds: z.array(deepDiveRoundSchema).max(3),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const tarotStreamRequestSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("synthesis"),
    session: apiSessionSchema,
  }),
  z.object({
    mode: z.literal("deep-dive"),
    session: apiSessionSchema,
    targetRound: deepDiveRoundSchema,
  }),
]);

export type ValidatedApiSession = z.infer<typeof apiSessionSchema>;
export type ValidatedDeepDiveRound = z.infer<typeof deepDiveRoundSchema>;

/**
 * Chuyển dữ liệu đã qua kiểm duyệt về đúng cấu trúc ReadingSession (lược bỏ fanPool nặng)
 */
export function toNormalizedReadingSession(
  validated: ValidatedApiSession,
): ReadingSession {
  return {
    ...validated,
    fanPool: [],
    pendingDeepDiveQuestion: null,
    clarifierFanPool: [],
    deepDiveRounds: validated.deepDiveRounds as readonly DeepDiveRound[],
  };
}
