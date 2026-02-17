"use client";

import { useEffect, useState } from "react";

interface StreakDisplayProps {
  streak: number;
  animate?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StreakDisplay({ streak, animate = false, size = "md" }: StreakDisplayProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animate) {
      setIsAnimating(true);
      const timeout = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [streak, animate]);

  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "text-base px-3 py-1.5",
    lg: "text-xl px-4 py-2",
  };

  const iconSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  if (streak === 0) {
    return (
      <div
        className={`
          inline-flex items-center gap-1.5 
          bg-gray-200 text-gray-400 
          font-bold rounded-full
          ${sizeClasses[size]}
        `}
      >
        <span className={`${iconSizes[size]} opacity-50`}>🔥</span>
        <span>0</span>
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 
        bg-gradient-to-r from-orange-500 to-red-500 
        text-white font-bold rounded-full shadow-md
        ${sizeClasses[size]}
        ${isAnimating ? "animate-pulse scale-110" : ""}
        transition-transform duration-200
      `}
    >
      <span 
        className={`
          ${iconSizes[size]} 
          ${isAnimating ? "animate-bounce" : ""}
        `}
      >
        🔥
      </span>
      <span>{streak}</span>
      {streak >= 7 && <span className="text-xs opacity-80">ימים</span>}
    </div>
  );
}
