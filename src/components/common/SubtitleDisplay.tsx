"use client";

import { motion, AnimatePresence } from "framer-motion";

type SubtitleDisplayProps = {
  text: string | null;
  speaker: "AVATAR" | "CHILD";
};

export function SubtitleDisplay({ text, speaker }: SubtitleDisplayProps) {
  return (
    <AnimatePresence mode="wait">
      {text && (
        <motion.div
          key={text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          dir={speaker === "AVATAR" ? "ltr" : undefined}
          className={`
            max-w-md mx-auto px-6 py-3 rounded-2xl text-center text-lg
            ${speaker === "AVATAR"
              ? "bg-purple-100 text-purple-900"
              : "bg-blue-100 text-blue-900"
            }
          `}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
