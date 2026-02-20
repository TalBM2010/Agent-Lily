"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { LESSON_TOPICS } from "@/lib/constants";
import { getOnboardingData } from "@/lib/onboarding";
import { PageContainer } from "@/components/navigation";
import type { LessonTopic } from "@/lib/types";

export default function TopicsPage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<LessonTopic | null>(null);
  const [childData, setChildData] = useState<{ childName: string; avatar: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setChildData(getOnboardingData());
    }
  }, []);

  const childName = childData?.childName ?? "";
  const childAvatar = childData?.avatar ?? "⭐";

  function handleStart() {
    if (!selectedTopic) return;
    router.push(`/lesson?topic=${selectedTopic}`);
  }

  return (
    <PageContainer
      showBottomNav={true}
      showTopNav={true}
      showBack={true}
      title="בחירת נושא"
    >
      <div className="max-w-lg mx-auto py-6 px-4">
        
        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="inline-block mb-4"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-lily flex items-center justify-center shadow-lg">
              <span className="text-4xl">{childAvatar}</span>
            </div>
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {childName ? `מה נלמד, ${childName}?` : "מה נלמד היום?"}
          </h1>
          <p className="text-lily font-medium">בחרי נושא!</p>
        </motion.div>

        {/* Topics Grid */}
        <motion.div
          className="bg-white rounded-2xl p-4 shadow-md mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-3 gap-3">
            {LESSON_TOPICS.map((topic, index) => {
              const isSelected = selectedTopic === topic.id;
              
              return (
                <motion.button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative p-4 rounded-xl transition-all duration-200
                    ${isSelected
                      ? "bg-lily text-white shadow-md"
                      : "bg-gray-50 hover:bg-gray-100"
                    }
                  `}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 bg-green rounded-full flex items-center justify-center shadow z-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <span className="text-white text-xs font-bold">✓</span>
                    </motion.div>
                  )}
                  
                  {/* Emoji */}
                  <span className="text-3xl block mb-2">{topic.emoji}</span>
                  
                  {/* Label */}
                  <span className={`
                    text-sm font-bold block
                    ${isSelected ? "text-white" : "text-gray-700"}
                  `}>
                    {topic.hebrewLabel}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.button
          onClick={handleStart}
          disabled={!selectedTopic}
          className={`
            w-full py-5 rounded-2xl text-xl font-bold
            flex items-center justify-center gap-3
            transition-all duration-200
            ${selectedTopic
              ? "bg-green text-white shadow-lg hover:bg-green-dark"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={selectedTopic ? { scale: 1.02 } : {}}
          whileTap={selectedTopic ? { scale: 0.98 } : {}}
        >
          {selectedTopic ? (
            <>
              <span>בואו נלמד!</span>
              <span className="text-2xl">🚀</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>בחרי נושא</span>
            </>
          )}
        </motion.button>

        {/* Hint */}
        {!selectedTopic && (
          <motion.p
            className="text-center text-gray-400 text-sm mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            לחצי על נושא כדי לבחור 👆
          </motion.p>
        )}
      </div>
    </PageContainer>
  );
}
