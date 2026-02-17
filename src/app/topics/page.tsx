"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LESSON_TOPICS } from "@/lib/constants";
import { getOnboardingData } from "@/lib/onboarding";
import type { LessonTopic } from "@/lib/types";

// Topic gradients for cards
const topicGradients: Record<LessonTopic, string> = {
  animals: "from-amber-400 to-orange-500",
  colors: "from-pink-400 to-purple-500",
  family: "from-rose-400 to-pink-500",
  food: "from-yellow-400 to-orange-500",
  numbers: "from-blue-400 to-indigo-500",
  body: "from-green-400 to-teal-500",
  clothes: "from-fuchsia-400 to-purple-500",
  weather: "from-sky-400 to-blue-500",
  school: "from-emerald-400 to-green-500",
  toys: "from-violet-400 to-purple-500",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.3,
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
  const childAvatar = onboardingData?.avatar ?? "⭐";

  function handleStart() {
    if (!selectedTopic) return;
    router.push(`/lesson?topic=${selectedTopic}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-5 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-5 w-80 h-80 bg-pink-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-yellow-100/40 rounded-full blur-3xl" />
      </div>

      {/* Floating sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-400/50"
          style={{
            top: `${15 + Math.random() * 70}%`,
            left: `${10 + Math.random() * 80}%`,
            fontSize: `${10 + Math.random() * 12}px`,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          ✦
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-5 py-10 min-h-screen">
        
        {/* Header with avatar */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Child's avatar */}
          <motion.div
            className="relative inline-block mb-4"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-6xl">{childAvatar}</span>
            
            {/* Lily peeking */}
            <motion.span
              className="absolute -right-6 -bottom-1 text-3xl"
              animate={{ rotate: [0, 10, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🧚
            </motion.span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            {childName ? `מה נלמד היום, ${childName}?` : "מה נלמד היום?"}
          </h1>
          <p className="text-lg text-purple-600/80">
            בחרי נושא שמעניין אותך!
          </p>
        </motion.div>

        {/* Topic grid */}
        <motion.div
          className="bg-white/60 backdrop-blur-sm rounded-[2rem] p-4 sm:p-6 shadow-lg border border-white/50 w-full max-w-md mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
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
                  relative flex flex-col items-center gap-2 p-4 sm:p-5
                  rounded-2xl transition-all duration-200
                  ${selectedTopic === topic.id
                    ? `bg-gradient-to-br ${topicGradients[topic.id]} shadow-lg`
                    : "bg-white hover:bg-gray-50 shadow-md"
                  }
                `}
              >
                {/* Selected check */}
                {selectedTopic === topic.id && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <span className="text-green-500 text-sm">✓</span>
                  </motion.div>
                )}
                
                {/* Emoji */}
                <span className={`text-4xl ${selectedTopic === topic.id ? "scale-110" : ""} transition-transform`}>
                  {topic.emoji}
                </span>
                
                {/* Label */}
                <span 
                  className={`font-bold text-sm sm:text-base ${
                    selectedTopic === topic.id ? "text-white" : "text-gray-700"
                  }`}
                >
                  {topic.hebrewLabel}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Start button */}
        <motion.button
          onClick={handleStart}
          disabled={!selectedTopic}
          className={`
            relative px-12 py-5 rounded-full text-xl font-bold
            transition-all duration-300 transform
            ${selectedTopic
              ? "text-white bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105 active:scale-95"
              : "text-gray-400 bg-gray-200 cursor-not-allowed"
            }
          `}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={selectedTopic ? { scale: 1.05 } : {}}
          whileTap={selectedTopic ? { scale: 0.95 } : {}}
        >
          {/* Shimmer */}
          {selectedTopic && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          )}
          
          <span className="relative flex items-center gap-3">
            {selectedTopic ? "בואו נלמד!" : "בחרי נושא"}
            {selectedTopic && <span className="text-2xl">🚀</span>}
          </span>
        </motion.button>

        {/* Hint */}
        <motion.p
          className="mt-6 text-purple-500/60 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          לילי מחכה ללמד אותך! ✨
        </motion.p>
      </div>
    </main>
  );
}
