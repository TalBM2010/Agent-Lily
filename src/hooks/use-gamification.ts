"use client";

import { useState, useEffect, useCallback } from "react";
import type { Level, AchievementDef } from "@/lib/gamification/constants";

interface ChildProgress {
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

interface NewAchievement {
  key: string;
  name: string;
  nameHe: string;
  emoji: string;
  description: string;
  descriptionHe: string;
}

interface UseGamificationReturn {
  // State
  stars: number;
  level: Level | null;
  levelProgress: number;
  starsToNextLevel: number;
  streak: number;
  longestStreak: number;
  achievements: string[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addStars: (amount: number, reason: string) => Promise<void>;
  recordAnswer: (isCorrect: boolean, attemptNumber?: 1 | 2 | 3) => Promise<{ starsEarned: number }>;
  recordLessonComplete: (options?: {
    wordsLearned?: number;
    correctAnswers?: number;
    totalAnswers?: number;
    isPerfect?: boolean;
  }) => Promise<void>;
  refetch: () => Promise<void>;

  // UI State
  showLevelUp: boolean;
  newLevel: Level | null;
  previousLevel: Level | null;
  closeLevelUp: () => void;

  showAchievement: boolean;
  newAchievement: NewAchievement | null;
  closeAchievement: () => void;
  
  // Achievement queue (for multiple achievements)
  achievementQueue: NewAchievement[];
}

export function useGamification(childId: string | null): UseGamificationReturn {
  // Progress state
  const [stars, setStars] = useState(0);
  const [level, setLevel] = useState<Level | null>(null);
  const [levelProgress, setLevelProgress] = useState(0);
  const [starsToNextLevel, setStarsToNextLevel] = useState(0);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState<Level | null>(null);
  const [previousLevel, setPreviousLevel] = useState<Level | null>(null);
  const [showAchievement, setShowAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState<NewAchievement | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<NewAchievement[]>([]);

  // Fetch progress
  const fetchProgress = useCallback(async () => {
    if (!childId) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/gamification/progress/${childId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch progress");
      }

      const data: ChildProgress = await response.json();
      
      setStars(data.stars);
      setLevel(data.level);
      setLevelProgress(data.levelProgress);
      setStarsToNextLevel(data.starsToNextLevel);
      setStreak(data.currentStreak);
      setLongestStreak(data.longestStreak);
      setAchievements(data.achievements);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Process achievement queue
  useEffect(() => {
    if (achievementQueue.length > 0 && !showAchievement) {
      const [next, ...rest] = achievementQueue;
      setNewAchievement(next);
      setShowAchievement(true);
      setAchievementQueue(rest);
    }
  }, [achievementQueue, showAchievement]);

  // Add stars
  const addStars = useCallback(async (amount: number, reason: string) => {
    if (!childId) return;

    try {
      const response = await fetch(`/api/gamification/stars/${childId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, reason }),
      });

      if (!response.ok) throw new Error("Failed to add stars");

      const data = await response.json();
      
      setStars(data.newTotal);

      if (data.leveledUp && data.newLevel) {
        setPreviousLevel(level);
        setNewLevel(data.newLevel);
        setLevel(data.newLevel);
        setShowLevelUp(true);
      }
    } catch (err) {
      console.error("Error adding stars:", err);
    }
  }, [childId, level]);

  // Record answer
  const recordAnswer = useCallback(async (
    isCorrect: boolean, 
    attemptNumber: 1 | 2 | 3 = 1
  ): Promise<{ starsEarned: number }> => {
    if (!childId) return { starsEarned: 0 };

    try {
      const response = await fetch(`/api/gamification/stars/${childId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "answer", isCorrect, attemptNumber }),
      });

      if (!response.ok) throw new Error("Failed to record answer");

      const data = await response.json();
      setStars(data.newTotal);

      return { starsEarned: data.starsEarned };
    } catch (err) {
      console.error("Error recording answer:", err);
      return { starsEarned: 0 };
    }
  }, [childId]);

  // Record lesson complete
  const recordLessonComplete = useCallback(async (options?: {
    wordsLearned?: number;
    correctAnswers?: number;
    totalAnswers?: number;
    isPerfect?: boolean;
  }) => {
    if (!childId) return;

    try {
      const response = await fetch(`/api/gamification/lesson-complete/${childId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options || {}),
      });

      if (!response.ok) throw new Error("Failed to record lesson completion");

      const data = await response.json();

      // Update streak
      setStreak(data.streak.current);
      if (data.streak.longest > longestStreak) {
        setLongestStreak(data.streak.longest);
      }

      // Handle level up
      if (data.levelUp) {
        setPreviousLevel(level);
        setNewLevel(data.levelUp.newLevel);
        setLevel(data.levelUp.newLevel);
        setShowLevelUp(true);
      }

      // Queue achievements
      if (data.newAchievements && data.newAchievements.length > 0) {
        setAchievementQueue((prev) => [...prev, ...data.newAchievements]);
        setAchievements((prev) => [
          ...prev,
          ...data.newAchievements.map((a: NewAchievement) => a.key),
        ]);
      }

      // Refetch to get updated stars
      await fetchProgress();
    } catch (err) {
      console.error("Error recording lesson completion:", err);
    }
  }, [childId, level, longestStreak, fetchProgress]);

  // Close handlers
  const closeLevelUp = useCallback(() => {
    setShowLevelUp(false);
    setNewLevel(null);
    setPreviousLevel(null);
  }, []);

  const closeAchievement = useCallback(() => {
    setShowAchievement(false);
    setNewAchievement(null);
  }, []);

  return {
    // State
    stars,
    level,
    levelProgress,
    starsToNextLevel,
    streak,
    longestStreak,
    achievements,
    isLoading,
    error,

    // Actions
    addStars,
    recordAnswer,
    recordLessonComplete,
    refetch: fetchProgress,

    // UI State
    showLevelUp,
    newLevel,
    previousLevel,
    closeLevelUp,
    showAchievement,
    newAchievement,
    closeAchievement,
    achievementQueue,
  };
}
