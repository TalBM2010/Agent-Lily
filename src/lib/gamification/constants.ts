/**
 * Gamification Constants
 * All game mechanics configuration in one place
 */

// =============================================================================
// LEVELS
// =============================================================================

export interface Level {
  level: number;
  name: string;
  nameHe: string;
  emoji: string;
  starsRequired: number;
}

export const LEVELS: Level[] = [
  { level: 1, name: "Chick", nameHe: "אפרוח", emoji: "🐣", starsRequired: 0 },
  { level: 2, name: "Chick", nameHe: "אפרוח", emoji: "🐣", starsRequired: 50 },
  { level: 3, name: "Chick", nameHe: "אפרוח", emoji: "🐣", starsRequired: 120 },
  { level: 4, name: "Chick", nameHe: "אפרוח", emoji: "🐣", starsRequired: 200 },
  { level: 5, name: "Chick", nameHe: "אפרוח", emoji: "🐣", starsRequired: 300 },
  { level: 6, name: "Nestling", nameHe: "גוזל", emoji: "🐥", starsRequired: 420 },
  { level: 7, name: "Nestling", nameHe: "גוזל", emoji: "🐥", starsRequired: 560 },
  { level: 8, name: "Nestling", nameHe: "גוזל", emoji: "🐥", starsRequired: 720 },
  { level: 9, name: "Nestling", nameHe: "גוזל", emoji: "🐥", starsRequired: 900 },
  { level: 10, name: "Nestling", nameHe: "גוזל", emoji: "🐥", starsRequired: 1100 },
  { level: 11, name: "Parrot", nameHe: "תוכי", emoji: "🦜", starsRequired: 1350 },
  { level: 12, name: "Parrot", nameHe: "תוכי", emoji: "🦜", starsRequired: 1650 },
  { level: 13, name: "Parrot", nameHe: "תוכי", emoji: "🦜", starsRequired: 2000 },
  { level: 14, name: "Parrot", nameHe: "תוכי", emoji: "🦜", starsRequired: 2400 },
  { level: 15, name: "Parrot", nameHe: "תוכי", emoji: "🦜", starsRequired: 2850 },
  { level: 16, name: "Eagle", nameHe: "נשר", emoji: "🦅", starsRequired: 3350 },
  { level: 17, name: "Eagle", nameHe: "נשר", emoji: "🦅", starsRequired: 3900 },
  { level: 18, name: "Eagle", nameHe: "נשר", emoji: "🦅", starsRequired: 4500 },
  { level: 19, name: "Eagle", nameHe: "נשר", emoji: "🦅", starsRequired: 5150 },
  { level: 20, name: "Eagle", nameHe: "נשר", emoji: "🦅", starsRequired: 5850 },
  { level: 21, name: "Magic Butterfly", nameHe: "פרפר קסום", emoji: "🦋", starsRequired: 6600 },
];

export function getLevelForStars(stars: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (stars >= LEVELS[i].starsRequired) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getNextLevel(currentLevel: number): Level | null {
  const nextLevelIndex = LEVELS.findIndex((l) => l.level === currentLevel + 1);
  return nextLevelIndex >= 0 ? LEVELS[nextLevelIndex] : null;
}

export function getLevelProgress(stars: number): { current: Level; next: Level | null; progress: number } {
  const current = getLevelForStars(stars);
  const next = getNextLevel(current.level);
  
  if (!next) {
    return { current, next: null, progress: 100 };
  }
  
  const starsInCurrentLevel = stars - current.starsRequired;
  const starsNeededForNext = next.starsRequired - current.starsRequired;
  const progress = Math.min(100, Math.floor((starsInCurrentLevel / starsNeededForNext) * 100));
  
  return { current, next, progress };
}

// =============================================================================
// ACHIEVEMENTS
// =============================================================================

export interface AchievementDef {
  key: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  emoji: string;
  category: "speaking" | "vocabulary" | "streak" | "accuracy" | "special";
}

export const ACHIEVEMENTS: Record<string, AchievementDef> = {
  // Speaking achievements
  first_lesson: {
    key: "first_lesson",
    name: "First Steps",
    nameHe: "צעדים ראשונים",
    description: "Complete your first lesson!",
    descriptionHe: "סיימת שיעור ראשון!",
    emoji: "🎉",
    category: "speaking",
  },
  spoke_10: {
    key: "spoke_10",
    name: "Chatterbox",
    nameHe: "מדברת",
    description: "Say 10 sentences!",
    descriptionHe: "אמרת 10 משפטים!",
    emoji: "🗣️",
    category: "speaking",
  },
  spoke_50: {
    key: "spoke_50",
    name: "Talkative",
    nameHe: "פטפטנית",
    description: "Say 50 sentences!",
    descriptionHe: "אמרת 50 משפטים!",
    emoji: "💬",
    category: "speaking",
  },
  spoke_100: {
    key: "spoke_100",
    name: "Speaker",
    nameHe: "דברנית",
    description: "Say 100 sentences!",
    descriptionHe: "אמרת 100 משפטים!",
    emoji: "🎤",
    category: "speaking",
  },
  spoke_500: {
    key: "spoke_500",
    name: "Orator",
    nameHe: "נואמת",
    description: "Say 500 sentences!",
    descriptionHe: "אמרת 500 משפטים!",
    emoji: "🎙️",
    category: "speaking",
  },

  // Vocabulary achievements
  words_20: {
    key: "words_20",
    name: "Word Collector",
    nameHe: "אספנית מילים",
    description: "Learn 20 new words!",
    descriptionHe: "למדת 20 מילים חדשות!",
    emoji: "📚",
    category: "vocabulary",
  },
  words_50: {
    key: "words_50",
    name: "Wise One",
    nameHe: "חכמה",
    description: "Learn 50 new words!",
    descriptionHe: "למדת 50 מילים חדשות!",
    emoji: "🧠",
    category: "vocabulary",
  },
  words_100: {
    key: "words_100",
    name: "Dictionary",
    nameHe: "מילונאית",
    description: "Learn 100 new words!",
    descriptionHe: "למדת 100 מילים חדשות!",
    emoji: "📖",
    category: "vocabulary",
  },
  words_200: {
    key: "words_200",
    name: "Professor",
    nameHe: "פרופסורית",
    description: "Learn 200 new words!",
    descriptionHe: "למדת 200 מילים חדשות!",
    emoji: "🎓",
    category: "vocabulary",
  },

  // Streak achievements
  streak_3: {
    key: "streak_3",
    name: "Persistent",
    nameHe: "מתמידה",
    description: "3 days in a row!",
    descriptionHe: "3 ימים ברצף!",
    emoji: "🔥",
    category: "streak",
  },
  streak_7: {
    key: "streak_7",
    name: "Hero",
    nameHe: "גיבורה",
    description: "A whole week in a row!",
    descriptionHe: "שבוע שלם ברצף!",
    emoji: "⭐",
    category: "streak",
  },
  streak_14: {
    key: "streak_14",
    name: "Champion",
    nameHe: "אלופה",
    description: "Two weeks in a row!",
    descriptionHe: "שבועיים ברצף!",
    emoji: "🏆",
    category: "streak",
  },
  streak_30: {
    key: "streak_30",
    name: "Legend",
    nameHe: "אגדה",
    description: "A whole month in a row!",
    descriptionHe: "חודש שלם ברצף!",
    emoji: "👑",
    category: "streak",
  },

  // Accuracy achievements
  accuracy_10: {
    key: "accuracy_10",
    name: "Precise",
    nameHe: "מדייקת",
    description: "10 correct answers in a row!",
    descriptionHe: "10 תשובות נכונות ברצף!",
    emoji: "🎯",
    category: "accuracy",
  },
  accuracy_25: {
    key: "accuracy_25",
    name: "Sharp",
    nameHe: "חדה",
    description: "25 correct answers in a row!",
    descriptionHe: "25 תשובות נכונות ברצף!",
    emoji: "💎",
    category: "accuracy",
  },
  accuracy_50: {
    key: "accuracy_50",
    name: "Perfect",
    nameHe: "מושלמת",
    description: "50 correct answers in a row!",
    descriptionHe: "50 תשובות נכונות ברצף!",
    emoji: "🌟",
    category: "accuracy",
  },

  // Special achievements
  early_bird: {
    key: "early_bird",
    name: "Early Bird",
    nameHe: "ציפור מוקדמת",
    description: "Practice before 8 AM!",
    descriptionHe: "תרגול לפני 8 בבוקר!",
    emoji: "🌅",
    category: "special",
  },
  night_owl: {
    key: "night_owl",
    name: "Night Owl",
    nameHe: "ינשופה",
    description: "Practice after 8 PM!",
    descriptionHe: "תרגול אחרי 8 בערב!",
    emoji: "🦉",
    category: "special",
  },
  weekend_warrior: {
    key: "weekend_warrior",
    name: "Weekend Warrior",
    nameHe: "לוחמת סופ״ש",
    description: "Practice on Shabbat!",
    descriptionHe: "תרגול בשבת!",
    emoji: "🎊",
    category: "special",
  },
};

export const ALL_ACHIEVEMENT_KEYS = Object.keys(ACHIEVEMENTS);

// =============================================================================
// STAR REWARDS
// =============================================================================

export const STAR_REWARDS = {
  // Per answer
  CORRECT_FIRST_TRY: 3,
  CORRECT_SECOND_TRY: 2,
  CORRECT_THIRD_TRY: 1,
  
  // Per lesson
  LESSON_COMPLETE: 5,
  PERFECT_LESSON: 10, // No mistakes
  
  // Per word
  NEW_WORD_LEARNED: 2,
  WORD_MASTERED: 5,
  
  // Streak bonuses
  STREAK_BONUS_PER_DAY: 1, // Added to every lesson completion based on streak
  STREAK_MILESTONE_3: 10,
  STREAK_MILESTONE_7: 25,
  STREAK_MILESTONE_14: 50,
  STREAK_MILESTONE_30: 100,
} as const;

// =============================================================================
// HELPERS
// =============================================================================

export function getStreakBonus(streak: number): number {
  return Math.min(streak, 7) * STAR_REWARDS.STREAK_BONUS_PER_DAY;
}

export function formatStars(stars: number): string {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}K`;
  }
  return stars.toString();
}
