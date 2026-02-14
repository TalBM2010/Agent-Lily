import type { LessonTopic, ChildAvatar } from "@/lib/types";
import type { DifficultyLevel } from "@/generated/prisma/client";

export const MAX_NEW_WORDS_PER_LESSON = 5;
export const MAX_RECORDING_SECONDS = 30;
export const MAX_TURNS_PER_LESSON = 20;
export const MASTERY_THRESHOLD = 3; // times correct before mastered

export const DIFFICULTY_LEVELS: Record<
  DifficultyLevel,
  { label: string; maxWordsPerSentence: number }
> = {
  BEGINNER: { label: "Beginner", maxWordsPerSentence: 5 },
  ELEMENTARY: { label: "Elementary", maxWordsPerSentence: 8 },
  INTERMEDIATE: { label: "Intermediate", maxWordsPerSentence: 12 },
};

export const LESSON_TOPICS: {
  id: LessonTopic;
  label: string;
  hebrewLabel: string;
  emoji: string;
  targetWords: string[];
}[] = [
  {
    id: "animals",
    label: "Animals",
    hebrewLabel: "חיות",
    emoji: "🐾",
    targetWords: ["dog", "cat", "bird", "fish", "rabbit", "horse", "cow", "pig"],
  },
  {
    id: "colors",
    label: "Colors",
    hebrewLabel: "צבעים",
    emoji: "🎨",
    targetWords: ["red", "blue", "green", "yellow", "pink", "purple", "orange", "white"],
  },
  {
    id: "family",
    label: "Family",
    hebrewLabel: "משפחה",
    emoji: "👨‍👩‍👧",
    targetWords: ["mom", "dad", "sister", "brother", "baby", "grandma", "grandpa"],
  },
  {
    id: "food",
    label: "Food",
    hebrewLabel: "אוכל",
    emoji: "🍎",
    targetWords: ["apple", "banana", "bread", "milk", "water", "cake", "pizza", "ice cream"],
  },
  {
    id: "numbers",
    label: "Numbers",
    hebrewLabel: "מספרים",
    emoji: "🔢",
    targetWords: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
  },
  {
    id: "body",
    label: "Body",
    hebrewLabel: "גוף",
    emoji: "🤸",
    targetWords: ["head", "hand", "foot", "eye", "ear", "nose", "mouth", "arm"],
  },
  {
    id: "clothes",
    label: "Clothes",
    hebrewLabel: "בגדים",
    emoji: "👗",
    targetWords: ["shirt", "pants", "shoes", "hat", "dress", "socks", "coat"],
  },
  {
    id: "weather",
    label: "Weather",
    hebrewLabel: "מזג אוויר",
    emoji: "☀️",
    targetWords: ["sun", "rain", "cloud", "snow", "wind", "hot", "cold"],
  },
  {
    id: "school",
    label: "School",
    hebrewLabel: "בית ספר",
    emoji: "📚",
    targetWords: ["book", "pen", "bag", "teacher", "desk", "chair", "draw"],
  },
  {
    id: "toys",
    label: "Toys",
    hebrewLabel: "צעצועים",
    emoji: "🧸",
    targetWords: ["ball", "doll", "car", "puzzle", "game", "blocks", "teddy bear"],
  },
];

export const CHILD_AVATARS: ChildAvatar[] = [
  { emoji: "🦄", label: "חד קרן" },
  { emoji: "🐱", label: "חתול" },
  { emoji: "🐼", label: "פנדה" },
  { emoji: "⭐", label: "כוכב" },
  { emoji: "🦋", label: "פרפר" },
  { emoji: "🐰", label: "ארנב" },
  { emoji: "🌈", label: "קשת" },
  { emoji: "🐶", label: "כלב" },
];

export const ELEVENLABS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Bella - warm friendly voice
