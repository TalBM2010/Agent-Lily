"use client";

import { useEffect, useState } from "react";
import type { Level } from "@/lib/gamification/constants";

interface LevelUpModalProps {
  level: Level;
  previousLevel?: Level;
  onClose: () => void;
}

export function LevelUpModal({ level, previousLevel, onClose }: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Auto-dismiss confetti after animation
    const timeout = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10%",
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              {["🎉", "⭐", "✨", "🌟", "💫"][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      {/* Modal content */}
      <div className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-sm mx-4 animate-modal-pop">
        {/* Big emoji */}
        <div className="text-8xl text-center mb-4 animate-bounce">
          {level.emoji}
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-purple-600 mb-2">
          כל הכבוד! 🎉
        </h2>

        {/* Level name */}
        <p className="text-xl text-center text-gray-700 mb-4">
          עלית לרמה {level.level}!
        </p>
        <p className="text-2xl font-bold text-center text-purple-500 mb-6">
          {level.nameHe}
        </p>

        {/* Previous level */}
        {previousLevel && (
          <p className="text-sm text-center text-gray-400 mb-6">
            {previousLevel.emoji} {previousLevel.nameHe} → {level.emoji} {level.nameHe}
          </p>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 
                     text-white text-xl font-bold rounded-full
                     shadow-lg hover:shadow-xl transform hover:scale-105
                     transition-all duration-200 active:scale-95"
        >
          יש! 🚀
        </button>
      </div>
    </div>
  );
}
