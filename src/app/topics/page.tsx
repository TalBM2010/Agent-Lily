"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import { LESSON_TOPICS } from "@/lib/constants";
import { getOnboardingData } from "@/lib/onboarding";
import { PageContainer } from "@/components/navigation";
import type { LessonTopic } from "@/lib/types";

// Vibrant topic themes
const topicThemes: Record<LessonTopic, { 
  gradient: string; 
  bg: string; 
  shadow: string;
  emoji: string;
}> = {
  animals: { 
    gradient: "from-amber-400 to-orange-500", 
    bg: "bg-amber-100", 
    shadow: "shadow-amber-200",
    emoji: "🦁"
  },
  colors: { 
    gradient: "from-fuchsia-400 to-pink-500", 
    bg: "bg-fuchsia-100", 
    shadow: "shadow-fuchsia-200",
    emoji: "🎨"
  },
  family: { 
    gradient: "from-rose-400 to-pink-500", 
    bg: "bg-rose-100", 
    shadow: "shadow-rose-200",
    emoji: "👨‍👩‍👧"
  },
  food: { 
    gradient: "from-yellow-400 to-orange-400", 
    bg: "bg-yellow-100", 
    shadow: "shadow-yellow-200",
    emoji: "🍕"
  },
  numbers: { 
    gradient: "from-blue-400 to-indigo-500", 
    bg: "bg-blue-100", 
    shadow: "shadow-blue-200",
    emoji: "🔢"
  },
  body: { 
    gradient: "from-emerald-400 to-green-500", 
    bg: "bg-emerald-100", 
    shadow: "shadow-emerald-200",
    emoji: "🖐️"
  },
  clothes: { 
    gradient: "from-purple-400 to-violet-500", 
    bg: "bg-purple-100", 
    shadow: "shadow-purple-200",
    emoji: "👕"
  },
  weather: { 
    gradient: "from-cyan-400 to-blue-500", 
    bg: "bg-cyan-100", 
    shadow: "shadow-cyan-200",
    emoji: "🌤️"
  },
  school: { 
    gradient: "from-teal-400 to-emerald-500", 
    bg: "bg-teal-100", 
    shadow: "shadow-teal-200",
    emoji: "📚"
  },
  toys: { 
    gradient: "from-violet-400 to-purple-500", 
    bg: "bg-violet-100", 
    shadow: "shadow-violet-200",
    emoji: "🎮"
  },
};

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
        
        {/* Header with Avatar */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="inline-block relative mb-4"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-lily-pink to-lily-pink-dark flex items-center justify-center shadow-xl">
              <span className="text-5xl">{childAvatar}</span>
            </div>
            <motion.span
              className="absolute -bottom-1 -right-2 text-3xl"
              animate={{ rotate: [0, 10, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🌸
            </motion.span>
          </motion.div>
          
          <h1 className="text-3xl font-bold text-text-dark mb-1">
            {childName ? `מה נלמד, ${childName}?` : "מה נלמד היום?"}
          </h1>
          <p className="text-lg text-garden-green-dark font-medium">בחרי נושא!</p>
        </motion.div>

        {/* Topics Grid */}
        <motion.div
          className="bg-white rounded-3xl p-5 shadow-xl border border-cream-200 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-3 gap-3">
            {LESSON_TOPICS.map((topic, index) => {
              const theme = topicThemes[topic.id];
              const isSelected = selectedTopic === topic.id;
              
              return (
                <motion.button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative p-4 rounded-2xl transition-all duration-200
                    ${isSelected
                      ? `bg-gradient-to-br ${theme.gradient} shadow-lg ${theme.shadow}`
                      : `${theme.bg} hover:shadow-md`
                    }
                  `}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-7 h-7 bg-garden-green rounded-full flex items-center justify-center shadow-lg z-10"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <span className="text-white text-sm font-bold">✓</span>
                    </motion.div>
                  )}
                  
                  {/* Icon */}
                  <motion.span 
                    className="text-4xl block mb-2"
                    animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {theme.emoji}
                  </motion.span>
                  
                  {/* Label */}
                  <span className={`
                    text-sm font-bold block
                    ${isSelected ? "text-white" : "text-text-dark"}
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
            transition-all duration-300
            ${selectedTopic
              ? "bg-gradient-to-r from-garden-green to-garden-green-dark text-white shadow-xl hover:shadow-2xl"
              : "bg-cream-200 text-text-light cursor-not-allowed"
            }
          `}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={selectedTopic ? { scale: 1.02, y: -2 } : {}}
          whileTap={selectedTopic ? { scale: 0.98 } : {}}
        >
          {selectedTopic ? (
            <>
              <span>בואו נלמד!</span>
              <motion.span 
                className="text-2xl"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🚀
              </motion.span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>בחרי נושא</span>
            </>
          )}
        </motion.button>

        {/* Hint text */}
        {!selectedTopic && (
          <motion.p
            className="text-center text-text-light text-sm mt-4"
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
