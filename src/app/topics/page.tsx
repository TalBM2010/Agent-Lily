"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LESSON_TOPICS } from "@/lib/constants";
import { getOnboardingData } from "@/lib/onboarding";
import type { LessonTopic } from "@/lib/types";

// Storybook-themed topic colors
const topicColors: Record<LessonTopic, { bg: string; border: string; selected: string }> = {
  animals: { bg: "bg-sunshine-light", border: "border-sunshine", selected: "bg-sunshine" },
  colors: { bg: "bg-lily-pink-light", border: "border-lily-pink", selected: "bg-lily-pink" },
  family: { bg: "bg-lily-pink-50", border: "border-lily-pink-light", selected: "bg-lily-pink-light" },
  food: { bg: "bg-sunshine-50", border: "border-sunshine-light", selected: "bg-sunshine-light" },
  numbers: { bg: "bg-story-blue-light", border: "border-story-blue", selected: "bg-story-blue" },
  body: { bg: "bg-garden-green-light", border: "border-garden-green", selected: "bg-garden-green" },
  clothes: { bg: "bg-lily-pink-light", border: "border-lily-pink", selected: "bg-lily-pink" },
  weather: { bg: "bg-story-blue-50", border: "border-story-blue-light", selected: "bg-story-blue-light" },
  school: { bg: "bg-garden-green-50", border: "border-garden-green-light", selected: "bg-garden-green-light" },
  toys: { bg: "bg-sunshine-light", border: "border-sunshine", selected: "bg-sunshine" },
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
    <main className="fixed inset-0 bg-storybook overflow-hidden relative">
      {/* Storybook decorations */}
      <div className="storybook-decorations">
        {/* Floating leaves */}
        <motion.span
          className="absolute text-3xl opacity-25"
          style={{ top: "10%", left: "5%" }}
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          🍃
        </motion.span>
        <motion.span
          className="absolute text-2xl opacity-20"
          style={{ bottom: "25%", right: "8%" }}
          animate={{ y: [0, -8, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          🌿
        </motion.span>
        
        {/* Floating flowers */}
        <motion.span
          className="absolute text-3xl opacity-35"
          style={{ top: "20%", right: "10%" }}
          animate={{ y: [0, -6, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          🌸
        </motion.span>
        <motion.span
          className="absolute text-2xl opacity-30"
          style={{ bottom: "15%", left: "12%" }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          🌷
        </motion.span>
        
        {/* Butterfly */}
        <motion.span
          className="absolute text-2xl opacity-40"
          style={{ top: "45%", left: "3%" }}
          animate={{ 
            x: [0, 25, 0], 
            y: [0, -15, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          🦋
        </motion.span>
      </div>

      {/* Warm vignette */}
      <div className="vignette" />

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
              animate={{ rotate: [0, 8, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🌸
            </motion.span>
          </div>
          
          <h1 className="text-2xl font-bold font-heading text-text-dark mb-0.5">
            {childName ? `מה נלמד, ${childName}?` : "מה נלמד היום?"}
          </h1>
          <p className="text-sm text-garden-green-dark font-medium">בחרי נושא!</p>
        </motion.div>

        {/* Topic grid - Book covers style */}
        <motion.div
          className="card-storybook p-4 w-full max-w-sm mb-4 border-3 border-wood-light"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-3 gap-2">
            {LESSON_TOPICS.map((topic, index) => {
              const colors = topicColors[topic.id];
              const isSelected = selectedTopic === topic.id;
              
              return (
                <motion.button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + index * 0.03 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative flex flex-col items-center gap-1 p-3
                    rounded-xl transition-all duration-200 border-2
                    ${isSelected
                      ? `${colors.selected} ${colors.border} shadow-warm`
                      : `${colors.bg} border-transparent hover:border-cream-300`
                    }
                  `}
                >
                  {isSelected && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-5 h-5 bg-garden-green rounded-full flex items-center justify-center shadow-sm"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <span className="text-white text-xs">✓</span>
                    </motion.div>
                  )}
                  
                  <span className="text-2xl">{topic.emoji}</span>
                  <span className={`text-xs font-bold ${isSelected ? "text-text-dark" : "text-text-medium"}`}>
                    {topic.hebrewLabel}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Start button */}
        <motion.button
          onClick={handleStart}
          disabled={!selectedTopic}
          className={`
            relative px-10 py-4 rounded-full text-lg font-bold font-heading
            transition-all duration-300
            ${selectedTopic
              ? "btn-primary"
              : "bg-cream-200 text-text-light cursor-not-allowed"
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
