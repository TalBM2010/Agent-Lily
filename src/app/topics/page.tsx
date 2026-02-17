"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LESSON_TOPICS } from "@/lib/constants";
import { getOnboardingData } from "@/lib/onboarding";
import { he } from "@/lib/he";
import type { LessonTopic } from "@/lib/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
    },
  },
};

export default function TopicsPage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<LessonTopic | null>(null);

  const [onboardingData] = useState(() => {
    if (typeof window === "undefined") return null;
    return getOnboardingData();
  });
  const childName = onboardingData?.childName ?? "";
  const avatar = onboardingData?.avatar ?? "";

  function handleStart() {
    if (!selectedTopic) return;
    router.push(`/lesson?topic=${selectedTopic}`);
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 sm:py-12">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float">✨</div>
        <div className="absolute top-40 right-10 text-5xl opacity-10 animate-float" style={{ animationDelay: "1s" }}>🌟</div>
        <div className="absolute bottom-40 left-20 text-4xl opacity-10 animate-float" style={{ animationDelay: "2s" }}>💫</div>
        <div className="absolute bottom-20 right-20 text-5xl opacity-10 animate-float" style={{ animationDelay: "0.5s" }}>⭐</div>
      </div>

      {/* Header */}
      <motion.div
        className="text-center mb-8 relative z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Avatar wave */}
        {avatar && (
          <motion.span
            className="text-5xl sm:text-6xl inline-block mb-4"
            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
          >
            {avatar}
          </motion.span>
        )}
        
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-magic mb-3">
          {he.topics.greeting(childName, "")}
        </h1>
        <p className="text-lg sm:text-xl text-purple-600 font-medium">
          {he.topics.subtitle}
        </p>
      </motion.div>

      {/* Topic grid */}
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-lg w-full mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {LESSON_TOPICS.map((topic) => (
          <motion.button
            key={topic.id}
            variants={itemVariants}
            onClick={() => setSelectedTopic(topic.id)}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative flex flex-col items-center gap-2 p-5 sm:p-6 
              rounded-3xl transition-all duration-200
              ${selectedTopic === topic.id
                ? "bg-white shadow-magic-lg ring-4 ring-purple-400 ring-offset-2"
                : "bg-white/80 shadow-magic hover:bg-white hover:shadow-magic-lg"
              }
            `}
          >
            {/* Selected indicator */}
            {selectedTopic === topic.id && (
              <motion.div
                className="absolute -top-2 -right-2 w-8 h-8 bg-magic rounded-full flex items-center justify-center shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <span className="text-white text-sm">✓</span>
              </motion.div>
            )}
            
            {/* Emoji */}
            <span 
              className={`
                text-4xl sm:text-5xl transition-transform duration-200
                ${selectedTopic === topic.id ? "scale-110" : ""}
              `}
            >
              {topic.emoji}
            </span>
            
            {/* Label */}
            <span 
              className={`
                font-heading font-bold text-base sm:text-lg
                ${selectedTopic === topic.id ? "text-purple-700" : "text-purple-600"}
              `}
            >
              {topic.hebrewLabel}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Start button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={handleStart}
          disabled={!selectedTopic}
          className={`
            relative overflow-hidden
            px-12 py-5 text-xl font-heading font-bold rounded-full
            transition-all duration-300
            ${selectedTopic
              ? "btn-magic cursor-pointer"
              : "bg-purple-200 text-purple-400 cursor-not-allowed shadow-none"
            }
          `}
          whileHover={selectedTopic ? { scale: 1.05 } : {}}
          whileTap={selectedTopic ? { scale: 0.95 } : {}}
        >
          {/* Shimmer effect */}
          {selectedTopic && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          )}
          
          <span className="relative z-10 flex items-center gap-2">
            {selectedTopic ? (
              <>
                {he.topics.startButton}
                <span className="text-2xl">🚀</span>
              </>
            ) : (
              he.topics.startButtonDisabled
            )}
          </span>
        </motion.button>
      </motion.div>

      {/* Bottom hint */}
      <motion.p
        className="text-purple-400 text-sm mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        בחרי נושא ולחצי להתחיל! ✨
      </motion.p>
    </main>
  );
}
