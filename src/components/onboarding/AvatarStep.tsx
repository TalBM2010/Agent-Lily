"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CHILD_AVATARS } from "@/lib/constants";
import { he } from "@/lib/he";

type AvatarStepProps = {
  childName: string;
  onComplete: (avatar: string) => void;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5, rotate: -10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 15,
    },
  },
};

export function AvatarStep({ childName, onComplete }: AvatarStepProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <motion.div
      className="flex flex-col items-center gap-8 w-full max-w-md"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
    >
      {/* Greeting */}
      <div className="text-center">
        <motion.h1 
          className="text-4xl sm:text-5xl font-heading font-bold text-magic mb-3"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {childName}! 🎉
        </motion.h1>
        <p className="text-xl text-purple-600 font-medium">
          {he.onboarding.avatarStep.subtitle}
        </p>
      </div>

      {/* Avatar grid */}
      <motion.div 
        className="grid grid-cols-4 gap-3 sm:gap-4 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {CHILD_AVATARS.map((avatar) => (
          <motion.button
            key={avatar.emoji}
            variants={itemVariants}
            onClick={() => setSelected(avatar.emoji)}
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.9 }}
            className={`
              relative flex flex-col items-center gap-1.5 p-3 sm:p-4 
              rounded-2xl transition-all duration-200
              ${selected === avatar.emoji
                ? "bg-white shadow-magic-lg ring-4 ring-purple-400 ring-offset-2 scale-110"
                : "bg-white/80 shadow-magic hover:bg-white"
              }
            `}
          >
            {/* Selected indicator */}
            {selected === avatar.emoji && (
              <motion.div
                className="absolute -top-2 -right-2 w-7 h-7 bg-magic rounded-full flex items-center justify-center shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <span className="text-white text-xs">✓</span>
              </motion.div>
            )}
            
            {/* Emoji */}
            <span 
              className={`
                text-4xl sm:text-5xl transition-transform duration-200
                ${selected === avatar.emoji ? "animate-bounce" : ""}
              `}
              style={{ animationDuration: selected === avatar.emoji ? "0.5s" : "0s" }}
            >
              {avatar.emoji}
            </span>
            
            {/* Label */}
            <span 
              className={`
                text-xs font-medium
                ${selected === avatar.emoji ? "text-purple-700" : "text-purple-500"}
              `}
            >
              {avatar.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Start button */}
      <motion.button
        onClick={() => selected && onComplete(selected)}
        disabled={!selected}
        className={`
          relative overflow-hidden
          px-12 py-5 text-xl font-heading font-bold rounded-full
          transition-all duration-300
          ${selected
            ? "btn-magic cursor-pointer"
            : "bg-purple-200 text-purple-400 cursor-not-allowed shadow-none"
          }
        `}
        whileHover={selected ? { scale: 1.05 } : {}}
        whileTap={selected ? { scale: 0.95 } : {}}
      >
        {/* Shimmer */}
        {selected && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        )}
        
        <span className="relative z-10 flex items-center gap-2">
          {he.onboarding.avatarStep.start}
          {selected && <span>🚀</span>}
        </span>
      </motion.button>
    </motion.div>
  );
}
