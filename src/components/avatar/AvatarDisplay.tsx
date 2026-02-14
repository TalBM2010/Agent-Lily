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

const orbConfigs = [
  { size: "w-32 h-32", color: "from-pink-400/30 to-purple-500/20", delay: 0, duration: 7, x: "10%", y: "15%" },
  { size: "w-24 h-24", color: "from-indigo-400/25 to-blue-500/15", delay: 2, duration: 8, x: "70%", y: "60%" },
  { size: "w-20 h-20", color: "from-violet-400/30 to-fuchsia-500/20", delay: 4, duration: 6, x: "75%", y: "10%" },
  { size: "w-28 h-28", color: "from-blue-400/20 to-indigo-500/15", delay: 1, duration: 9, x: "20%", y: "70%" },
];

export function AvatarDisplay({ state, topic }: AvatarDisplayProps) {
  const avatar = topic ? topicAvatars[topic] : defaultAvatar;
  const stateLabel = he.avatar.stateLabels[state] || "";

  return (
    <div className="relative flex flex-col items-center gap-4 w-full h-full">
      {/* Floating background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {orbConfigs.map((orb, i) => (
          <motion.div
            key={i}
            className={`absolute ${orb.size} rounded-full bg-gradient-to-br ${orb.color} blur-xl`}
            style={{ left: orb.x, top: orb.y }}
            animate={{ y: [0, -20, 0] }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              delay: orb.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center gap-4 my-auto">
        {/* Avatar glow ring */}
        <div className="relative">
          <motion.div
            className="absolute -inset-4 md:-inset-6 rounded-full bg-gradient-to-br from-purple-400/40 via-pink-400/30 to-indigo-400/40 blur-xl"
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Listening pulse ring */}
          {state === "listening" && (
            <motion.div
              className="absolute -inset-4 rounded-full bg-green-300/40"
              animate={{ scale: [1, 1.2], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          {/* Avatar circle */}
          <motion.div
            className={`relative w-64 h-64 md:w-[28rem] md:h-[28rem] rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center shadow-xl shadow-purple-500/20 border-4 border-white/80`}
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
              className="text-8xl md:text-[12rem] select-none"
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
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 bg-white/80 rounded-full"
                animate={{ height: [4, 10, 4, 14, 6, 4] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </motion.div>
        </div>

        {/* Name */}
        <p className="text-2xl md:text-3xl font-bold text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
          {he.avatar.name}
        </p>

        {/* State label pill */}
        {stateLabel && (
          <motion.span
            className="px-4 py-1 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium text-white/80"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            key={state}
          >
            {stateLabel}
          </motion.span>
        )}
      </div>
    </div>
  );
}
