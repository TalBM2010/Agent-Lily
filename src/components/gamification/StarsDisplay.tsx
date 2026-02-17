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
    sm: "text-sm px-3 py-1.5 gap-1.5",
    md: "text-base px-4 py-2 gap-2",
    lg: "text-xl px-5 py-2.5 gap-2",
  };

  const iconSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div
      className={`
        inline-flex items-center font-heading font-bold
        bg-gold text-white
        rounded-full shadow-gold
        ${sizeClasses[size]}
        ${isAnimating ? "animate-bounce scale-110" : ""}
        transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-lg
      `}
    >
      <span className={`${iconSizes[size]} drop-shadow-md`}>⭐</span>
      <span className="drop-shadow-sm">{formatStars(displayStars)}</span>
    </div>
  );
}
