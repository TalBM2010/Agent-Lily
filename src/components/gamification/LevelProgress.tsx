"use client";

import { useEffect, useState } from "react";
import type { Level } from "@/lib/gamification/constants";

interface LevelProgressProps {
  level: Level;
  progress: number;
  starsToNext: number;
  animate?: boolean;
}

export function LevelProgress({ level, progress, starsToNext, animate = false }: LevelProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

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
    <div className="w-full">
      {/* Level badge and name */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{level.emoji}</span>
          <div>
            <span className="font-bold text-gray-800">{level.nameHe}</span>
            <span className="text-gray-400 text-sm mr-2"> רמה {level.level}</span>
          </div>
        </div>
        {starsToNext > 0 && (
          <span className="text-sm text-gray-500">
            עוד {starsToNext} ⭐ לרמה הבאה
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 
                     rounded-full transition-all duration-700 ease-out
                     relative overflow-hidden"
          style={{ width: `${displayProgress}%` }}
        >
          {/* Shimmer effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                       animate-shimmer"
          />
        </div>
      </div>

      {/* Progress percentage */}
      <div className="flex justify-end mt-1">
        <span className="text-xs text-gray-400">{progress}%</span>
      </div>
    </div>
  );
}
