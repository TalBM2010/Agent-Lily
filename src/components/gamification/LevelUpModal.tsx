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
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Stagger animations
    const contentTimeout = setTimeout(() => setShowContent(true), 200);
    const confettiTimeout = setTimeout(() => setShowConfetti(false), 4000);

    return () => {
      clearTimeout(contentTimeout);
      clearTimeout(confettiTimeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - warm overlay */}
      <div 
        className="absolute inset-0 bg-wood-dark/50 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10%",
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2.5 + Math.random() * 2}s`,
              }}
            >
              {["🎉", "⭐", "✨", "🌟", "🌸", "🎊", "🌿", "🦋"][Math.floor(Math.random() * 8)]}
            </div>
          ))}
        </div>
      )}

      {/* Modal content - Storybook style */}
      <div 
        className={`
          relative card-storybook p-8 max-w-sm w-full mx-4 
          shadow-warm-xl border-3 border-wood-light
          ${showContent ? "animate-modal-pop" : "opacity-0 scale-75"}
        `}
      >
        {/* Warm glow ring */}
        <div className="absolute -inset-1 bg-sunshine rounded-[2rem] opacity-20 blur-xl animate-warm-glow" />
        
        <div className="relative">
          {/* Big emoji with animation */}
          <div className="text-center mb-4">
            <span 
              className="text-8xl inline-block animate-bounce drop-shadow-lg"
              style={{ animationDuration: "1s" }}
            >
              {level.emoji}
            </span>
          </div>

          {/* Sparkles around emoji */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-32 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <span
                key={i}
                className="absolute text-xl animate-sparkle"
                style={{
                  top: `${50 + 45 * Math.sin((i * 60 * Math.PI) / 180)}%`,
                  left: `${50 + 45 * Math.cos((i * 60 * Math.PI) / 180)}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              >
                ✨
              </span>
            ))}
          </div>

          {/* Title */}
          <h2 className="text-3xl font-heading font-bold text-center text-garden-green-dark mb-2">
            כל הכבוד! 🎉
          </h2>

          {/* Level number */}
          <p className="text-xl text-center text-text-medium font-medium mb-4">
            עלית לרמה {level.level}!
          </p>
          
          {/* Level name */}
          <p className="text-2xl font-heading font-bold text-center text-text-dark mb-6">
            {level.nameHe}
          </p>

          {/* Previous level transition */}
          {previousLevel && (
            <div className="flex items-center justify-center gap-3 text-lg text-text-light mb-8">
              <span>{previousLevel.emoji}</span>
              <span>{previousLevel.nameHe}</span>
              <span>→</span>
              <span>{level.emoji}</span>
              <span className="text-text-dark font-medium">{level.nameHe}</span>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full btn-primary text-xl py-4 animate-breathe"
          >
            יש! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
