"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CHILD_AVATARS } from "@/lib/constants";
import { he } from "@/lib/he";

type AvatarStepProps = {
  childName: string;
  onComplete: (avatar: string) => void;
};

export function AvatarStep({ childName, onComplete }: AvatarStepProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <motion.div
      className="flex flex-col items-center gap-8 w-full max-w-sm"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
    >
      <h1 className="text-3xl font-bold text-purple-600">
        {childName} 🎉
      </h1>
      <p className="text-xl text-gray-600">
        {he.onboarding.avatarStep.subtitle}
      </p>

      <div className="grid grid-cols-4 gap-4 w-full">
        {CHILD_AVATARS.map((avatar, i) => (
          <motion.button
            key={avatar.emoji}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => setSelected(avatar.emoji)}
            className={`
              flex flex-col items-center gap-1 p-3 rounded-2xl border-3 transition-all
              ${selected === avatar.emoji
                ? "border-purple-500 bg-purple-100 shadow-md scale-110"
                : "border-gray-200 bg-white hover:border-purple-300"
              }
            `}
          >
            <span className="text-4xl">{avatar.emoji}</span>
            <span className="text-xs text-gray-500">{avatar.label}</span>
          </motion.button>
        ))}
      </div>

      <motion.button
        onClick={() => selected && onComplete(selected)}
        disabled={!selected}
        className={`
          px-10 py-4 text-xl font-bold rounded-full shadow-lg transition-all
          ${selected
            ? "bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 cursor-pointer"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
        whileTap={selected ? { scale: 0.95 } : {}}
      >
        {he.onboarding.avatarStep.start}
      </motion.button>
    </motion.div>
  );
}
