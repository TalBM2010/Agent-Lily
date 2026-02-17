/**
 * Gamification Service
 * Handles all game mechanics: stars, levels, streaks, achievements
 */

import { db } from "@/lib/db";
import {
  LEVELS,
  ACHIEVEMENTS,
  STAR_REWARDS,
  getLevelForStars,
  getNextLevel,
  getLevelProgress,
  getStreakBonus,
  type Level,
  type AchievementDef,
} from "@/lib/gamification/constants";

// =============================================================================
// TYPES
// =============================================================================

export interface AddStarsResult {
  newTotal: number;
  added: number;
  leveledUp: boolean;
  newLevel?: Level;
  previousLevel?: Level;
}

export interface UpdateStreakResult {
  currentStreak: number;
  previousStreak: number;
  isNewRecord: boolean;
  longestStreak: number;
  streakBroken: boolean;
}

export interface AwardedAchievement {
  key: string;
  achievement: AchievementDef;
  earnedAt: Date;
}

export interface ChildProgress {
  childId: string;
  stars: number;
  level: Level;
  levelProgress: number;
  starsToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  achievements: string[];
  totalLessons: number;
  totalWordsLearned: number;
}

// =============================================================================
// STARS
// =============================================================================

export async function addStars(
  childId: string,
  amount: number,
  reason: string
): Promise<AddStarsResult> {
  const child = await db.child.findUnique({
    where: { id: childId },
    select: { stars: true, gamificationLevel: true },
  });

  if (!child) {
    throw new Error(`Child not found: ${childId}`);
  }

  const previousLevel = getLevelForStars(child.stars);
  const newTotal = child.stars + amount;
  const newLevelData = getLevelForStars(newTotal);
  const leveledUp = newLevelData.level > previousLevel.level;

  // Update child's stars and level
  await db.child.update({
    where: { id: childId },
    data: {
      stars: newTotal,
      gamificationLevel: newLevelData.level,
    },
  });

  // Update daily activity
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db.dailyActivity.upsert({
    where: {
      childId_date: {
        childId,
        date: today,
      },
    },
    update: {
      starsEarned: { increment: amount },
    },
    create: {
      childId,
      date: today,
      starsEarned: amount,
    },
  });

  console.log(`[Gamification] Added ${amount} stars to child ${childId} for: ${reason}. New total: ${newTotal}`);

  if (leveledUp) {
    console.log(`[Gamification] Child ${childId} leveled up! ${previousLevel.level} → ${newLevelData.level}`);
  }

  return {
    newTotal,
    added: amount,
    leveledUp,
    newLevel: leveledUp ? newLevelData : undefined,
    previousLevel: leveledUp ? previousLevel : undefined,
  };
}

// =============================================================================
// STREAKS
// =============================================================================

export async function updateStreak(childId: string): Promise<UpdateStreakResult> {
  const child = await db.child.findUnique({
    where: { id: childId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActivityDate: true,
    },
  });

  if (!child) {
    throw new Error(`Child not found: ${childId}`);
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActivity = child.lastActivityDate
    ? new Date(child.lastActivityDate.getFullYear(), child.lastActivityDate.getMonth(), child.lastActivityDate.getDate())
    : null;

  let newStreak: number;
  let streakBroken = false;

  if (!lastActivity) {
    // First activity ever
    newStreak = 1;
  } else {
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, keep streak
      newStreak = child.currentStreak;
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      newStreak = child.currentStreak + 1;
    } else {
      // Streak broken
      newStreak = 1;
      streakBroken = child.currentStreak > 0;
    }
  }

  const newLongestStreak = Math.max(newStreak, child.longestStreak);
  const isNewRecord = newStreak > child.longestStreak;

  await db.child.update({
    where: { id: childId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActivityDate: now,
    },
  });

  console.log(`[Gamification] Updated streak for child ${childId}: ${child.currentStreak} → ${newStreak}`);

  if (isNewRecord) {
    console.log(`[Gamification] New streak record for child ${childId}: ${newStreak} days!`);
  }

  return {
    currentStreak: newStreak,
    previousStreak: child.currentStreak,
    isNewRecord,
    longestStreak: newLongestStreak,
    streakBroken,
  };
}

// =============================================================================
// ACHIEVEMENTS
// =============================================================================

export async function checkAndAwardAchievements(
  childId: string
): Promise<AwardedAchievement[]> {
  const child = await db.child.findUnique({
    where: { id: childId },
    select: {
      currentStreak: true,
      totalLessons: true,
      totalWordsLearned: true,
      accuracyStreak: true,
      achievements: {
        select: { key: true },
      },
    },
  });

  if (!child) {
    throw new Error(`Child not found: ${childId}`);
  }

  // Count turns where child spoke
  const turnCount = await db.turn.count({
    where: {
      lesson: { childId },
      speaker: "CHILD",
    },
  });

  const earnedKeys = new Set(child.achievements.map((a: { key: string }) => a.key));
  const newAchievements: AwardedAchievement[] = [];
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

  // Define conditions for each achievement
  const conditions: Record<string, boolean> = {
    // Speaking
    first_lesson: child.totalLessons >= 1,
    spoke_10: turnCount >= 10,
    spoke_50: turnCount >= 50,
    spoke_100: turnCount >= 100,
    spoke_500: turnCount >= 500,

    // Vocabulary
    words_20: child.totalWordsLearned >= 20,
    words_50: child.totalWordsLearned >= 50,
    words_100: child.totalWordsLearned >= 100,
    words_200: child.totalWordsLearned >= 200,

    // Streak
    streak_3: child.currentStreak >= 3,
    streak_7: child.currentStreak >= 7,
    streak_14: child.currentStreak >= 14,
    streak_30: child.currentStreak >= 30,

    // Accuracy
    accuracy_10: child.accuracyStreak >= 10,
    accuracy_25: child.accuracyStreak >= 25,
    accuracy_50: child.accuracyStreak >= 50,

    // Special
    early_bird: hour < 8,
    night_owl: hour >= 20,
    weekend_warrior: dayOfWeek === 6, // Saturday
  };

  // Check and award achievements
  for (const [key, condition] of Object.entries(conditions)) {
    if (condition && !earnedKeys.has(key) && ACHIEVEMENTS[key]) {
      await db.achievement.create({
        data: {
          childId,
          key,
          type: categoryToType(ACHIEVEMENTS[key].category),
          name: ACHIEVEMENTS[key].name,
        },
      });

      newAchievements.push({
        key,
        achievement: ACHIEVEMENTS[key],
        earnedAt: now,
      });

      console.log(`[Gamification] Child ${childId} earned achievement: ${key}`);
    }
  }

  return newAchievements;
}

function categoryToType(category: string): "STREAK" | "MILESTONE" | "BADGE" | "VOCABULARY" {
  switch (category) {
    case "streak":
      return "STREAK";
    case "vocabulary":
      return "VOCABULARY";
    case "accuracy":
    case "special":
      return "BADGE";
    default:
      return "MILESTONE";
  }
}

// =============================================================================
// PROGRESS
// =============================================================================

export async function getChildProgress(childId: string): Promise<ChildProgress> {
  const child = await db.child.findUnique({
    where: { id: childId },
    select: {
      stars: true,
      currentStreak: true,
      longestStreak: true,
      totalLessons: true,
      totalWordsLearned: true,
      achievements: {
        select: { key: true },
      },
    },
  });

  if (!child) {
    throw new Error(`Child not found: ${childId}`);
  }

  const { current, next, progress } = getLevelProgress(child.stars);

  return {
    childId,
    stars: child.stars,
    level: current,
    levelProgress: progress,
    starsToNextLevel: next ? next.starsRequired - child.stars : 0,
    currentStreak: child.currentStreak,
    longestStreak: child.longestStreak,
    achievements: child.achievements.map((a: { key: string }) => a.key),
    totalLessons: child.totalLessons,
    totalWordsLearned: child.totalWordsLearned,
  };
}

// =============================================================================
// LESSON COMPLETION
// =============================================================================

export async function recordLessonCompletion(
  childId: string,
  options: {
    wordsLearned?: number;
    correctAnswers?: number;
    totalAnswers?: number;
    isPerfect?: boolean;
  } = {}
): Promise<{
  starsEarned: number;
  streakResult: UpdateStreakResult;
  newAchievements: AwardedAchievement[];
  leveledUp: boolean;
  newLevel?: Level;
}> {
  const { wordsLearned = 0, correctAnswers = 0, totalAnswers = 0, isPerfect = false } = options;

  // Update streak first
  const streakResult = await updateStreak(childId);

  // Calculate stars
  let starsEarned = STAR_REWARDS.LESSON_COMPLETE;
  
  // Add streak bonus
  starsEarned += getStreakBonus(streakResult.currentStreak);

  // Perfect lesson bonus
  if (isPerfect && totalAnswers > 0) {
    starsEarned += STAR_REWARDS.PERFECT_LESSON;
  }

  // Words learned bonus
  starsEarned += wordsLearned * STAR_REWARDS.NEW_WORD_LEARNED;

  // Streak milestone bonuses
  if (streakResult.currentStreak === 3 && streakResult.previousStreak < 3) {
    starsEarned += STAR_REWARDS.STREAK_MILESTONE_3;
  } else if (streakResult.currentStreak === 7 && streakResult.previousStreak < 7) {
    starsEarned += STAR_REWARDS.STREAK_MILESTONE_7;
  } else if (streakResult.currentStreak === 14 && streakResult.previousStreak < 14) {
    starsEarned += STAR_REWARDS.STREAK_MILESTONE_14;
  } else if (streakResult.currentStreak === 30 && streakResult.previousStreak < 30) {
    starsEarned += STAR_REWARDS.STREAK_MILESTONE_30;
  }

  // Add stars
  const starsResult = await addStars(childId, starsEarned, "lesson_complete");

  // Update lesson count and words learned
  await db.child.update({
    where: { id: childId },
    data: {
      totalLessons: { increment: 1 },
      totalWordsLearned: { increment: wordsLearned },
    },
  });

  // Update daily activity
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db.dailyActivity.upsert({
    where: {
      childId_date: {
        childId,
        date: today,
      },
    },
    update: {
      lessonsCompleted: { increment: 1 },
      wordsLearned: { increment: wordsLearned },
    },
    create: {
      childId,
      date: today,
      lessonsCompleted: 1,
      wordsLearned,
    },
  });

  // Check achievements
  const newAchievements = await checkAndAwardAchievements(childId);

  return {
    starsEarned,
    streakResult,
    newAchievements,
    leveledUp: starsResult.leveledUp,
    newLevel: starsResult.newLevel,
  };
}

// =============================================================================
// ACCURACY TRACKING
// =============================================================================

export async function recordAnswer(
  childId: string,
  isCorrect: boolean,
  attemptNumber: 1 | 2 | 3
): Promise<{
  starsEarned: number;
  newTotal: number;
  accuracyStreak: number;
}> {
  let starsEarned = 0;

  if (isCorrect) {
    switch (attemptNumber) {
      case 1:
        starsEarned = STAR_REWARDS.CORRECT_FIRST_TRY;
        break;
      case 2:
        starsEarned = STAR_REWARDS.CORRECT_SECOND_TRY;
        break;
      case 3:
        starsEarned = STAR_REWARDS.CORRECT_THIRD_TRY;
        break;
    }
  }

  // Update accuracy streak
  const child = await db.child.findUnique({
    where: { id: childId },
    select: { accuracyStreak: true },
  });

  const newAccuracyStreak = isCorrect ? (child?.accuracyStreak || 0) + 1 : 0;

  await db.child.update({
    where: { id: childId },
    data: {
      accuracyStreak: newAccuracyStreak,
    },
  });

  // Add stars if earned
  let newTotal = 0;
  if (starsEarned > 0) {
    const result = await addStars(childId, starsEarned, `correct_answer_attempt_${attemptNumber}`);
    newTotal = result.newTotal;
  } else {
    const c = await db.child.findUnique({ where: { id: childId }, select: { stars: true } });
    newTotal = c?.stars || 0;
  }

  return {
    starsEarned,
    newTotal,
    accuracyStreak: newAccuracyStreak,
  };
}
