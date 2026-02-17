"use client";

import { useEffect, useState } from "react";
import { formatStars } from "@/lib/gamification/constants";

interface StarsDisplayProps {
  stars: number;
  animate?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StarsDisplay({ stars, animate = false, size = "md" }: StarsDisplayProps) {
  const [displayStars, setDisplayStars] = useState(stars);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animate && stars !== displayStars) {
      setIsAnimating(true);
      
      // Animate the number counting up
      const diff = stars - displayStars;
      const steps = Math.min(Math.abs(diff), 20);
      const stepValue = diff / steps;
      let current = displayStars;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        current += stepValue;
        setDisplayStars(Math.round(current));

        if (step >= steps) {
          clearInterval(interval);
          setDisplayStars(stars);
          setTimeout(() => setIsAnimating(false), 300);
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      setDisplayStars(stars);
    }
  }, [stars, animate, displayStars]);

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

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 
        bg-gradient-to-r from-yellow-400 to-amber-500 
        text-white font-bold rounded-full shadow-md
        ${sizeClasses[size]}
        ${isAnimating ? "animate-bounce" : ""}
        transition-transform duration-200
      `}
    >
      <span className={`${iconSizes[size]}`}>⭐</span>
      <span>{formatStars(displayStars)}</span>
    </div>
  );
}
