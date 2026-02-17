"use client";

import { useEffect, useState } from "react";

interface StreakDisplayProps {
  streak: number;
  animate?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StreakDisplay({ streak, animate = false, size = "md" }: StreakDisplayProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevStreak, setPrevStreak] = useState(streak);

  useEffect(() => {
    if (animate && streak > prevStreak) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
    setPrevStreak(streak);
  }, [streak, animate, prevStreak]);

  const sizeClasses = {
    sm: "text-sm px-3 py-1.5 gap-1.5",
    md: "text-base px-4 py-2 gap-2",
    lg: "text-xl px-5 py-2.5 gap-2",
  };

  const iconSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  // Fire intensity based on streak
  const getFireColor = () => {
    if (streak >= 30) return "from-red-500 via-orange-500 to-yellow-400";
    if (streak >= 14) return "from-orange-500 via-amber-500 to-yellow-400";
    if (streak >= 7) return "from-orange-400 via-amber-400 to-yellow-300";
    return "from-orange-300 via-amber-300 to-yellow-200";
  };

  return (
    <div
      className={`
        inline-flex items-center font-heading font-bold
        bg-gradient-to-r ${getFireColor()}
        text-white
        rounded-full
        ${sizeClasses[size]}
        ${isAnimating ? "animate-wiggle scale-110" : ""}
        transition-all duration-300 ease-out
        hover:scale-105
        shadow-md hover:shadow-lg
      `}
      style={{
        boxShadow: streak >= 7 
          ? "0 4px 15px -3px rgba(249, 115, 22, 0.5)" 
          : "0 4px 10px -3px rgba(249, 115, 22, 0.3)"
      }}
    >
      <span 
        className={`
          ${iconSizes[size]} 
          ${streak >= 7 ? "animate-pulse" : ""} 
          drop-shadow-md
        `}
      >
        🔥
      </span>
      <span className="drop-shadow-sm">{streak}</span>
      {streak >= 7 && (
        <span className="text-xs opacity-80">ימים!</span>
      )}
    </div>
  );
}
