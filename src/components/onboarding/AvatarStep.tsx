"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CHILD_AVATARS } from "@/lib/constants";

type AvatarStepProps = {
  childName: string;
  onComplete: (avatar: string) => void;
};

// Avatar background gradients for preview
const avatarGradients: Record<string, string> = {
  "🦄": "from-pink-300 to-purple-400",
  "🐱": "from-amber-200 to-orange-400",
  "🐼": "from-gray-200 to-gray-400",
  "⭐": "from-yellow-200 to-amber-400",
  "🦋": "from-cyan-300 to-blue-400",
  "🐰": "from-pink-200 to-rose-400",
  "🌈": "from-pink-300 to-violet-400",
  "🐶": "from-amber-200 to-yellow-400",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
    },
  },
};

export function AvatarStep({ childName, onComplete }: AvatarStepProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedGradient = selected ? avatarGradients[selected] || "from-purple-300 to-pink-400" : "";

  return (
    <motion.div
      className="flex flex-col items-center gap-8 w-full max-w-md"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
    >
      {/* Preview of selected avatar or greeting */}
      <div className="text-center">
        {selected ? (
          <motion.div
            className="relative mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {/* Glow */}
            <div className={`absolute -inset-3 bg-gradient-to-br ${selectedGradient} rounded-full blur-xl opacity-50`} />
            
            {/* Avatar circle */}
            <motion.div 
              className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${selectedGradient} flex items-center justify-center shadow-xl border-4 border-white/80`}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-6xl">{selected}</span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.span
            className="text-6xl inline-block mb-4"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            🎉
          </motion.span>
        )}

        <motion.h1 
          className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          יופי, {childName}!
        </motion.h1>
        <motion.p 
          className="text-lg text-purple-600/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          בחרי דמות שתלווה אותך בשיעורים
        </motion.p>
      </div>

      {/* Avatar grid */}
      <motion.div
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-lg border border-white/50 w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div 
          className="grid grid-cols-4 gap-3"
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
                relative flex flex-col items-center gap-1 p-3 
                rounded-2xl transition-all duration-200
                ${selected === avatar.emoji
                  ? `bg-gradient-to-br ${avatarGradients[avatar.emoji] || "from-purple-200 to-pink-200"} shadow-lg scale-105`
                  : "bg-gray-50 hover:bg-gray-100"
                }
              `}
            >
              {/* Selected check */}
              {selected === avatar.emoji && (
                <motion.div
                  className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
              
              {/* Emoji */}
              <span className="text-4xl">{avatar.emoji}</span>
              
              {/* Label */}
              <span 
                className={`text-xs font-medium ${
                  selected === avatar.emoji ? "text-white" : "text-gray-500"
                }`}
              >
                {avatar.label}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Start button */}
      <motion.button
        onClick={() => selected && onComplete(selected)}
        disabled={!selected}
        className={`
          relative px-12 py-5 rounded-full text-xl font-bold
          transition-all duration-300 transform
          ${selected
            ? "text-white bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105 active:scale-95"
            : "text-gray-400 bg-gray-200 cursor-not-allowed"
          }
        `}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        whileHover={selected ? { scale: 1.05 } : {}}
        whileTap={selected ? { scale: 0.95 } : {}}
      >
        {/* Shimmer */}
        {selected && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        )}
        
        <span className="relative flex items-center gap-3">
          {selected ? "בואו נתחיל!" : "בחרי דמות"}
          {selected && <span className="text-2xl">🚀</span>}
        </span>
      </motion.button>
    </motion.div>
  );
}
