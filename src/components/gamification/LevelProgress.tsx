"use client";

import { useEffect, useState } from "react";
import type { Level } from "@/lib/gamification/constants";
import { getNextLevel } from "@/lib/gamification/constants";

interface LevelProgressProps {
  level: Level;
  progress: number;
  starsToNext: number;
  animate?: boolean;
}

export function LevelProgress({ level, progress, starsToNext, animate = false }: LevelProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const nextLevel = getNextLevel(level.level);

  useEffect(() => {
    if (animate) {
      // Animate progress bar filling
      const timeout = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, animate]);

  return (
    <div className="space-y-2">
      {/* Level info row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{level.emoji}</span>
          <div>
            <span className="font-heading font-bold text-purple-700">
              {level.nameHe}
            </span>
            <span className="text-purple-400 mx-2">•</span>
            <span className="text-purple-500 font-medium">
              רמה {level.level}
            </span>
          </div>
        </div>
        
        {nextLevel && (
          <div className="flex items-center gap-1.5 text-sm text-purple-400">
            <span>עוד {starsToNext} ⭐</span>
            <span>→</span>
            <span className="text-lg">{nextLevel.emoji}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative h-4 bg-purple-100 rounded-full overflow-hidden shadow-inner">
        {/* Shimmer effect on track */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        
        {/* Progress fill */}
        <div
          className="absolute inset-y-0 left-0 bg-magic rounded-full transition-all duration-700 ease-out"
          style={{ width: `${displayProgress}%` }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-white/50 rounded-full" />
          
          {/* Sparkle at the end */}
          {displayProgress > 10 && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg animate-pulse" />
          )}
        </div>

        {/* Next level emoji peeking */}
        {nextLevel && displayProgress > 80 && (
          <div 
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm opacity-50"
          >
            {nextLevel.emoji}
          </div>
        )}
      </div>

      {/* Progress percentage */}
      <div className="text-center">
        <span className="text-xs font-medium text-purple-400">
          {displayProgress}% לרמה הבאה
        </span>
      </div>
    </div>
  );
}
