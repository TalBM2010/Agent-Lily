import type { DifficultyLevel, Speaker } from "@/generated/prisma/client";

export type AvatarState = "idle" | "listening" | "thinking" | "speaking";

export type LessonTopic =
  | "animals"
  | "colors"
  | "family"
  | "food"
  | "numbers"
  | "body"
  | "clothes"
  | "weather"
  | "school"
  | "toys";

export type ConversationState = {
  lessonId: string;
  childId: string;
  topic: LessonTopic;
  difficulty: DifficultyLevel;
  turns: ConversationTurn[];
  isActive: boolean;
};

export type ConversationTurn = {
  id: string;
  speaker: Speaker;
  text: string;
  audioUrl?: string;
  createdAt: Date;
};

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
  nativeLanguage: string;
  currentLevel: DifficultyLevel;
  knownWords: string[];
};

export type LessonSummary = {
  id: string;
  topic: string;
  difficulty: DifficultyLevel;
  score: number | null;
  startedAt: Date;
  completedAt: Date | null;
  turnCount: number;
};

export type ChildProgress = {
  totalLessons: number;
  totalWords: number;
  masteredWords: number;
  recentLessons: LessonSummary[];
};

export type ChildAvatar = {
  emoji: string;
  label: string;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};
