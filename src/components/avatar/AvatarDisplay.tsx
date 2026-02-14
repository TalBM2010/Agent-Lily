"use client";

import { motion } from "framer-motion";
import type { AvatarState } from "@/lib/types";
import type { LessonTopic } from "@/lib/types";
import { he } from "@/lib/he";

type AvatarDisplayProps = {
  state: AvatarState;
  topic?: LessonTopic | null;
};

const topicAvatars: Record<LessonTopic, { emoji: string; bg: string }> = {
  animals: { emoji: "🦁", bg: "from-amber-300 to-orange-400" },
  colors: { emoji: "🌈", bg: "from-pink-400 to-violet-400" },
  family: { emoji: "🏠", bg: "from-rose-300 to-pink-400" },
  food: { emoji: "🧁", bg: "from-yellow-300 to-orange-300" },
  numbers: { emoji: "🔢", bg: "from-blue-300 to-indigo-400" },
  body: { emoji: "🤸", bg: "from-green-300 to-teal-400" },
  clothes: { emoji: "👗", bg: "from-fuchsia-300 to-purple-400" },
  weather: { emoji: "☀️", bg: "from-sky-300 to-blue-400" },
  school: { emoji: "📚", bg: "from-emerald-300 to-green-400" },
  toys: { emoji: "🧸", bg: "from-amber-200 to-yellow-400" },
};

const defaultAvatar = { emoji: "🌟", bg: "from-purple-400 to-pink-400" };

export function AvatarDisplay({ state, topic }: AvatarDisplayProps) {
  const avatar = topic ? topicAvatars[topic] : defaultAvatar;
  const stateLabel = he.avatar.stateLabels[state] || "";

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Outer glow ring */}
      <div className="relative">
        {state === "listening" && (
          <motion.div
            className="absolute -inset-3 rounded-full bg-green-300/40"
            animate={{ scale: [1, 1.15], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Avatar circle */}
        <motion.div
          className={`relative w-44 h-44 rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center shadow-xl border-4 border-white`}
          animate={{
            scale:
              state === "speaking"
                ? [1, 1.06, 1]
                : state === "listening"
                  ? [1, 1.03, 1]
                  : state === "thinking"
                    ? [1, 0.97, 1]
                    : 1,
          }}
          transition={{
            duration: state === "speaking" ? 0.5 : state === "thinking" ? 1.5 : 1,
            repeat: state === "idle" ? 0 : Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Topic emoji */}
          <motion.span
            className="text-7xl select-none"
            animate={
              state === "speaking"
                ? { rotate: [0, -5, 5, -3, 0] }
                : state === "thinking"
                  ? { y: [0, -4, 0] }
                  : {}
            }
            transition={{
              duration: state === "speaking" ? 0.6 : 2,
              repeat: state === "idle" ? 0 : Infinity,
              ease: "easeInOut",
            }}
          >
            {avatar.emoji}
          </motion.span>

          {/* Speaking mouth indicator */}
          {state === "speaking" && (
            <motion.div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 bg-white/80 rounded-full"
              animate={{ height: [4, 10, 4, 14, 6, 4] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>

      {/* Name */}
      <p className="text-xl font-bold text-purple-700">{he.avatar.name}</p>

      {/* State label */}
      {stateLabel && (
        <motion.p
          className="text-sm font-medium text-gray-500"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          key={state}
        >
          {stateLabel}
        </motion.p>
      )}
    </div>
  );
}
