export type ArcanaType = "major" | "minor";

export type SuitType = "major" | "wands" | "cups" | "swords" | "pentacles";

export type CardOrientation = "upright" | "reversed";

export type TopicId =
  | "general"
  | "love"
  | "career"
  | "finance"
  | "self"
  | "crossroads";

export type ThemeMode = "dark" | "light";

export type ReadingStep =
  | "intention"
  | "breathing"
  | "shuffling"
  | "drawing"
  | "synthesis"
  | "deep-dive"
  | "closure";

export type DeepDiveRoundNumber = 1 | 2 | 3;

export interface TarotCardDefinition {
  readonly id: string;
  readonly number: number;
  readonly arcana: ArcanaType;
  readonly suit: SuitType;
  readonly nameEn: string;
  readonly nameVi: string;
  readonly keywordsUpright: readonly string[];
  readonly keywordsReversed: readonly string[];
  readonly meaningUpright: string;
  readonly meaningReversed: string;
  readonly imageUrl: string;
}

export interface FanCardItem {
  readonly fanId: string;
  readonly cardId: string;
  readonly orientation: CardOrientation;
  readonly isPicked: boolean;
}

export interface DrawnCard {
  readonly cardId: string;
  readonly positionIndex: number;
  readonly positionLabel: string;
  readonly orientation: CardOrientation;
  readonly isRevealed: boolean;
  readonly isClarifier: boolean;
  readonly clarifierRound?: DeepDiveRoundNumber;
}

export interface DeepDiveRound {
  readonly round: DeepDiveRoundNumber;
  readonly question: string;
  readonly clarifierCard: DrawnCard;
  readonly aiResponse: string;
  readonly createdAt: string;
}

export interface ReadingSession {
  readonly id: string;
  readonly topicId: TopicId;
  readonly question: string;
  readonly allowReversed: boolean;
  readonly step: ReadingStep;
  readonly fanPool: readonly FanCardItem[];
  readonly initialCards: readonly DrawnCard[];
  readonly synthesisText: string;
  readonly deepDiveRounds: readonly DeepDiveRound[];
  readonly suggestedDeepDiveQuestions?: readonly string[];
  readonly pendingDeepDiveQuestion: string | null;
  readonly clarifierFanPool: readonly FanCardItem[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TopicPreset {
  readonly id: TopicId;
  readonly label: string;
  readonly spreadPositions: readonly [string, string, string];
  readonly sampleQuestions: readonly string[];
  readonly deepDiveSuggestions: readonly string[];
}

export interface ServiceResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
}
