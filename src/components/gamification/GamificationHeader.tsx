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
      <div className="flex items-center justify-between px-4 py-3 glass rounded-2xl shadow-magic">
        <div className="flex items-center gap-3">
          <StarsDisplay stars={stars} animate={animateStars} size="sm" />
          <StreakDisplay streak={streak} animate={animateStreak} size="sm" />
        </div>
        
        {level && (
          <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full">
            <span className="text-xl">{level.emoji}</span>
            <span className="text-sm font-heading font-bold text-purple-700">
              {level.nameHe}
            </span>
          </div>
        )}

        {onAchievementsClick && (
          <button
            onClick={onAchievementsClick}
            className="p-2.5 bg-white/50 hover:bg-white/80 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <span className="text-xl">🏆</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="card-magic p-5 space-y-4">
      {/* Top row: Stars, Streak, Achievements */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <StarsDisplay stars={stars} animate={animateStars} size="md" />
          <StreakDisplay streak={streak} animate={animateStreak} size="md" />
        </div>

        {onAchievementsClick && (
          <button
            onClick={onAchievementsClick}
            className="flex items-center gap-2 btn-magic text-base"
          >
            <span>🏆</span>
            <span>הישגים</span>
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
