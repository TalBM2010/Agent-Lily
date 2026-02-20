"use client";

import { useEffect, useState } from "react";

interface AchievementPopupProps {
  achievement: {
    key: string;
    name: string;
    nameHe: string;
    emoji: string;
    description: string;
    descriptionHe: string;
  };
  onClose: () => void;
  autoCloseMs?: number;
}

export function AchievementPopup({ 
  achievement, 
  onClose, 
  autoCloseMs = 4000 
}: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    const showTimeout = setTimeout(() => setIsVisible(true), 50);

    // Auto-close
    const closeTimeout = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, autoCloseMs);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(closeTimeout);
    };
  }, [autoCloseMs, onClose]);

  return (
    <div 
      className={`
        fixed bottom-8 left-1/2 -translate-x-1/2 z-50
        transition-all duration-300 ease-out
        ${isVisible && !isExiting 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-8"}
      `}
    >
      <div 
        className="card-storybook rounded-2xl shadow-warm-xl p-4 flex items-center gap-4
                   border-3 border-sunshine min-w-[280px]"
        onClick={onClose}
      >
        {/* Emoji */}
        <div className="text-4xl animate-bounce">{achievement.emoji}</div>

        {/* Content */}
        <div className="flex-1">
          <div className="text-xs text-sunshine-dark font-semibold mb-0.5">
            🌟 הישג חדש!
          </div>
          <div className="font-bold font-heading text-text-dark">
            {achievement.nameHe}
          </div>
          <div className="text-sm text-text-light">
            {achievement.descriptionHe}
          </div>
        </div>

        {/* Star */}
        <div className="text-2xl">⭐</div>
      </div>
    </div>
  );
}
