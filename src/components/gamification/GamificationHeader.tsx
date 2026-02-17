"use client";

import { StarsDisplay } from "./StarsDisplay";
import { StreakDisplay } from "./StreakDisplay";
import { LevelProgress } from "./LevelProgress";
import type { Level } from "@/lib/gamification/constants";

interface GamificationHeaderProps {
  stars: number;
  streak: number;
  level: Level | null;
  levelProgress: number;
  starsToNextLevel: number;
  onAchievementsClick?: () => void;
  animateStars?: boolean;
  animateStreak?: boolean;
  compact?: boolean;
}

export function GamificationHeader({
  stars,
  streak,
  level,
  levelProgress,
  starsToNextLevel,
  onAchievementsClick,
  animateStars = false,
  animateStreak = false,
  compact = false,
}: GamificationHeaderProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <StarsDisplay stars={stars} animate={animateStars} size="sm" />
          <StreakDisplay streak={streak} animate={animateStreak} size="sm" />
        </div>
        
        {level && (
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{level.emoji}</span>
            <span className="text-sm font-medium text-gray-600">
              Lv.{level.level}
            </span>
          </div>
        )}

        {onAchievementsClick && (
          <button
            onClick={onAchievementsClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            🏆
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-4 space-y-4">
      {/* Top row: Stars, Streak, Achievements */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <StarsDisplay stars={stars} animate={animateStars} size="md" />
          <StreakDisplay streak={streak} animate={animateStreak} size="md" />
        </div>

        {onAchievementsClick && (
          <button
            onClick={onAchievementsClick}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 
                       text-white font-bold rounded-full shadow-md
                       hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <span>🏆</span>
            <span className="text-sm">הישגים</span>
          </button>
        )}
      </div>

      {/* Level progress bar */}
      {level && (
        <LevelProgress
          level={level}
          progress={levelProgress}
          starsToNext={starsToNextLevel}
          animate={animateStars}
        />
      )}
    </div>
  );
}
