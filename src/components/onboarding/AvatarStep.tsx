"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CHILD_AVATARS } from "@/lib/constants";

type AvatarStepProps = {
  childName: string;
  onComplete: (avatar: string) => void;
};

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

export function AvatarStep({ childName, onComplete }: AvatarStepProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedGradient = selected ? avatarGradients[selected] || "from-purple-300 to-pink-400" : "";

  return (
    <motion.div
      className="flex flex-col items-center w-full max-w-sm px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Selected avatar preview or greeting */}
      <div className="mb-4 text-center">
        {selected ? (
          <motion.div
            className="relative inline-block mb-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className={`absolute -inset-2 bg-gradient-to-br ${selectedGradient} rounded-full blur-lg opacity-50`} />
            <motion.div 
              className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${selectedGradient} flex items-center justify-center shadow-lg border-2 border-white/80`}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-4xl">{selected}</span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.span
            className="text-5xl inline-block mb-2"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            🎉
          </motion.span>
        )}

        <h1 className="text-2xl font-bold text-gray-800">
          יופי, {childName}!
        </h1>
        <p className="text-sm text-purple-600/80">
          בחרי דמות שתלווה אותך
        </p>
      </div>

      {/* Avatar grid */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/50 w-full mb-4">
        <div className="grid grid-cols-4 gap-2">
          {CHILD_AVATARS.map((avatar) => (
            <motion.button
              key={avatar.emoji}
              onClick={() => setSelected(avatar.emoji)}
              whileTap={{ scale: 0.9 }}
              className={`
                relative flex flex-col items-center gap-0.5 p-2 
                rounded-xl transition-all duration-200
                ${selected === avatar.emoji
                  ? `bg-gradient-to-br ${avatarGradients[avatar.emoji] || "from-purple-200 to-pink-200"} shadow-md`
                  : "bg-gray-50 active:bg-gray-100"
                }
              `}
            >
              {selected === avatar.emoji && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
              
              <span className="text-3xl">{avatar.emoji}</span>
              <span className={`text-[10px] font-medium ${selected === avatar.emoji ? "text-white" : "text-gray-500"}`}>
                {avatar.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <motion.button
        onClick={() => selected && onComplete(selected)}
        disabled={!selected}
        className={`
          relative px-10 py-4 rounded-full text-lg font-bold
          transition-all duration-300
          ${selected
            ? "text-white bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 shadow-lg shadow-purple-500/30 active:scale-95"
            : "text-gray-400 bg-gray-200 cursor-not-allowed"
          }
        `}
        whileTap={selected ? { scale: 0.95 } : {}}
      >
        <span className="flex items-center gap-2">
          {selected ? "בואו נתחיל!" : "בחרי דמות"}
          {selected && <span className="text-xl">🚀</span>}
        </span>
      </motion.button>
    </motion.div>
  );
}
