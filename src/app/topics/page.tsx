"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LESSON_TOPICS } from "@/lib/constants";
import { getOnboardingData } from "@/lib/onboarding";
import type { LessonTopic } from "@/lib/types";

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
    <main className="fixed inset-0 bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 overflow-hidden">
      {/* Background blurs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-56 h-56 bg-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-64 h-64 bg-pink-200/40 rounded-full blur-3xl" />
      </div>

      {/* Sparkles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-400/40 text-sm"
          style={{ top: `${25 + i * 18}%`, left: `${15 + i * 22}%` }}
          animate={{ y: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
        >
          ✦
        </motion.div>
      ))}

      {/* Content - centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
        
        {/* Header */}
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative inline-block mb-2">
            <motion.span
              className="text-5xl"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {childAvatar}
            </motion.span>
            <motion.span
              className="absolute -right-4 -bottom-1 text-2xl"
              animate={{ rotate: [0, 8, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🧚
            </motion.span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-0.5">
            {childName ? `מה נלמד, ${childName}?` : "מה נלמד היום?"}
          </h1>
          <p className="text-sm text-purple-600/80">בחרי נושא!</p>
        </motion.div>

        {/* Topic grid */}
        <motion.div
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/50 w-full max-w-sm mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-3 gap-2">
            {LESSON_TOPICS.map((topic) => (
              <motion.button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative flex flex-col items-center gap-1 p-3
                  rounded-xl transition-all duration-200
                  ${selectedTopic === topic.id
                    ? `bg-gradient-to-br ${topicGradients[topic.id]} shadow-md`
                    : "bg-white active:bg-gray-50 shadow-sm"
                  }
                `}
              >
                {selectedTopic === topic.id && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <span className="text-green-500 text-xs">✓</span>
                  </motion.div>
                )}
                
                <span className="text-2xl">{topic.emoji}</span>
                <span className={`text-xs font-bold ${selectedTopic === topic.id ? "text-white" : "text-gray-700"}`}>
                  {topic.hebrewLabel}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Start button */}
        <motion.button
          onClick={handleStart}
          disabled={!selectedTopic}
          className={`
            relative px-10 py-4 rounded-full text-lg font-bold
            transition-all duration-300
            ${selectedTopic
              ? "text-white bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 shadow-lg shadow-purple-500/30 active:scale-95"
              : "text-gray-400 bg-gray-200 cursor-not-allowed"
            }
          `}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileTap={selectedTopic ? { scale: 0.95 } : {}}
        >
          <span className="flex items-center gap-2">
            {selectedTopic ? "בואו נלמד!" : "בחרי נושא"}
            {selectedTopic && <span className="text-xl">🚀</span>}
          </span>
        </motion.button>
      </div>
    </main>
  );
}
