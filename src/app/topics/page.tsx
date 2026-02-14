"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LESSON_TOPICS } from "@/lib/constants";
import { getOnboardingData } from "@/lib/onboarding";
import { he } from "@/lib/he";
import type { LessonTopic } from "@/lib/types";

export default function TopicsPage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<LessonTopic | null>(null);

  // Lazy initialization — reads localStorage once, no effect needed
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
    <main className="flex flex-col items-center px-4 py-12 gap-8">
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-purple-600 mb-2">
          {he.topics.greeting(childName, avatar)}
        </h1>
        <p className="text-xl text-gray-600">
          {he.topics.subtitle}
        </p>
      </motion.div>

      {/* Topic grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg w-full">
        {LESSON_TOPICS.map((topic, i) => (
          <motion.button
            key={topic.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedTopic(topic.id)}
            className={`
              flex flex-col items-center gap-2 p-4 rounded-2xl border-3 transition-all
              ${selectedTopic === topic.id
                ? "border-purple-500 bg-purple-100 shadow-md"
                : "border-gray-200 bg-white hover:border-purple-300 hover:shadow"
              }
            `}
          >
            <span className="text-4xl">{topic.emoji}</span>
            <span className="font-medium text-gray-700">{topic.hebrewLabel}</span>
          </motion.button>
        ))}
      </div>

      {/* Start button */}
      <motion.button
        onClick={handleStart}
        disabled={!selectedTopic}
        className={`
          px-10 py-4 text-xl font-bold rounded-full shadow-lg transition-all
          ${selectedTopic
            ? "bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 cursor-pointer"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
        whileTap={selectedTopic ? { scale: 0.95 } : {}}
      >
        {selectedTopic ? he.topics.startButton : he.topics.startButtonDisabled}
      </motion.button>
    </main>
  );
}
