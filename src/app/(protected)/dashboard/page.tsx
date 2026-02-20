"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Star, Flame, Trophy, BookOpen, Gamepad2, 
  ChevronLeft, Sparkles, Target, Zap
} from "lucide-react";
import { PageContainer } from "@/components/navigation";
import { LESSON_TOPICS } from "@/lib/constants";
import { getLevelForStars, getNextLevel, ACHIEVEMENTS, type Level } from "@/lib/gamification/constants";

interface ChildData {
  id: string;
  name: string;
  avatar: string;
  stars: number;
  currentStreak: number;
  longestStreak: number;
  totalLessons: number;
  totalWordsLearned: number;
  gamificationLevel: number;
  lastActivityDate: string | null;
}

interface ProgressData {
  childId: string;
  stars: number;
  level: Level;
  levelProgress: number;
  starsToNextLevel: number;
  currentStreak: number;
  achievements: string[];
  recentActivity: {
    date: string;
    lessonsCompleted: number;
    starsEarned: number;
  }[];
}

// Storybook-themed topic colors
const topicColors: Record<string, { bg: string; hover: string }> = {
  animals: { bg: "bg-sunshine", hover: "hover:bg-sunshine-dark" },
  colors: { bg: "bg-lily-pink", hover: "hover:bg-lily-pink-dark" },
  family: { bg: "bg-lily-pink-light", hover: "hover:bg-lily-pink" },
  food: { bg: "bg-sunshine-light", hover: "hover:bg-sunshine" },
  numbers: { bg: "bg-story-blue", hover: "hover:bg-story-blue-dark" },
  body: { bg: "bg-garden-green", hover: "hover:bg-garden-green-dark" },
  clothes: { bg: "bg-lily-pink", hover: "hover:bg-lily-pink-dark" },
  weather: { bg: "bg-story-blue-light", hover: "hover:bg-story-blue" },
  school: { bg: "bg-garden-green-light", hover: "hover:bg-garden-green" },
  toys: { bg: "bg-sunshine", hover: "hover:bg-sunshine-dark" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [child, setChild] = useState<ChildData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const childId = localStorage.getItem("selectedChildId");
    if (!childId) {
      router.push("/children");
      return;
    }
    
    fetchChildData(childId);
  }, [router]);

  async function fetchChildData(childId: string) {
    try {
      const [childRes, progressRes] = await Promise.all([
        fetch(`/api/child/${childId}`),
        fetch(`/api/gamification/progress/${childId}`),
      ]);

      if (childRes.ok) {
        const childData = await childRes.json();
        setChild(childData.child);
      }

      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(progressData);
      }
    } catch (error) {
      console.error("Failed to fetch child data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const level = child ? getLevelForStars(child.stars) : null;
  const nextLevel = level ? getNextLevel(level.level) : null;
  const levelProgress = progress?.levelProgress ?? 0;
  const starsToNext = progress?.starsToNextLevel ?? 0;

  // Find next milestones
  const nextMilestones = progress?.achievements
    ? Object.entries(ACHIEVEMENTS)
        .filter(([key]) => !progress.achievements.includes(key))
        .slice(0, 3)
        .map(([, achievement]) => achievement)
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-storybook flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.span
            className="text-6xl block mb-4"
            animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🌸
          </motion.span>
          <p className="text-garden-green-dark font-medium">טוען...</p>
        </motion.div>
      </div>
    );
  }

  if (!child) {
    // If child data failed to load, redirect back to children selection
    router.push("/children");
    return (
      <div className="min-h-screen bg-storybook flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.span
            className="text-4xl block mb-2"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            🔄
          </motion.span>
          <p className="text-text-light">חוזרים לבחירת ילד...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <PageContainer
      showBack={true}
      showBottomNav={true}
      showTopNav={false}
    >
      <div className="max-w-lg mx-auto space-y-4 pb-4">
        {/* Hero Header - Storybook Chapter Style */}
        <motion.div
          className="relative card-storybook p-6 overflow-hidden border-3 border-wood-light"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Corner decorations */}
          <div className="absolute top-2 left-2 text-xl opacity-40">🌿</div>
          <div className="absolute top-2 right-2 text-xl opacity-40">🌸</div>
          
          {/* User info */}
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                className="w-20 h-20 bg-sunshine-light rounded-2xl flex items-center justify-center text-4xl shadow-warm border-3 border-sunshine"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {child.avatar}
              </motion.div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold font-heading text-text-dark mb-1">
                  שלום, {child.name}! 👋
                </h1>
                <div className="flex items-center gap-2 text-garden-green-dark">
                  <span className="text-xl">{level?.emoji}</span>
                  <span className="font-medium">{level?.nameHe}</span>
                  <span className="text-text-light">רמה {level?.level}</span>
                </div>
              </div>
            </div>

            {/* Stats row - Wood/parchment style */}
            <div className="flex items-center justify-between bg-cream-200 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-sunshine-dark" />
                <span className="font-bold text-text-dark">{child.stars}</span>
              </div>
              <div className="h-6 w-px bg-wood-light" />
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-lily-pink-dark" />
                <span className="font-bold text-text-dark">{child.currentStreak} ימים</span>
              </div>
              <div className="h-6 w-px bg-wood-light" />
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-sunshine-dark" />
                <span className="font-bold text-text-dark">{progress?.achievements.length || 0}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Level Progress Card */}
        {level && (
          <motion.div
            className="card-storybook p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{level.emoji}</span>
                <div>
                  <h3 className="font-bold font-heading text-text-dark">{level.nameHe}</h3>
                  <p className="text-xs text-text-light">רמה {level.level}</p>
                </div>
              </div>
              {nextLevel && (
                <div className="flex items-center gap-2 text-text-light">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-xl">{nextLevel.emoji}</span>
                  <span className="text-sm">{nextLevel.nameHe}</span>
                </div>
              )}
            </div>
            
            {/* Progress bar - Garden/nature style */}
            <div className="relative h-4 bg-cream-200 rounded-full overflow-hidden border border-wood-light">
              <motion.div
                className="absolute inset-y-0 left-0 bg-garden-gradient rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-text-dark">
                  {starsToNext > 0 ? `עוד ${starsToNext} ⭐ לרמה הבאה` : "🎉"}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions - Storybook chapter buttons */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={() => router.push("/topics")}
            className="relative card-book p-4 text-right overflow-hidden group"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute top-2 left-2 opacity-20">
              <BookOpen className="w-8 h-8 text-garden-green" />
            </div>
            <div className="relative z-10">
              <span className="text-2xl mb-2 block">📚</span>
              <h3 className="font-bold font-heading text-lg text-text-dark">להתחיל שיעור</h3>
              <p className="text-sm text-text-light">בחרי נושא חדש</p>
            </div>
          </motion.button>

          <motion.button
            onClick={() => router.push("/games")}
            className="relative card-book p-4 text-right overflow-hidden group"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute top-2 left-2 opacity-20">
              <Gamepad2 className="w-8 h-8 text-lily-pink" />
            </div>
            <div className="relative z-10">
              <span className="text-2xl mb-2 block">🎮</span>
              <h3 className="font-bold font-heading text-lg text-text-dark">משחקים</h3>
              <p className="text-sm text-text-light">תרגול כייפי</p>
            </div>
          </motion.button>
        </motion.div>

        {/* My Progress Section */}
        <motion.div
          className="card-storybook p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-bold font-heading text-lg text-text-dark mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-garden-green" />
            ההתקדמות שלי
          </h2>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-cream-100 rounded-xl p-3 text-center border border-cream-200">
              <span className="text-2xl block mb-1">📖</span>
              <p className="text-2xl font-bold text-garden-green-dark">{child.totalLessons}</p>
              <p className="text-xs text-text-light">שיעורים</p>
            </div>
            <div className="bg-lily-pink-50 rounded-xl p-3 text-center border border-lily-pink-100">
              <span className="text-2xl block mb-1">🔤</span>
              <p className="text-2xl font-bold text-lily-pink-dark">{child.totalWordsLearned}</p>
              <p className="text-xs text-text-light">מילים</p>
            </div>
            <div className="bg-sunshine-50 rounded-xl p-3 text-center border border-sunshine-100">
              <span className="text-2xl block mb-1">🔥</span>
              <p className="text-2xl font-bold text-sunshine-dark">{child.longestStreak}</p>
              <p className="text-xs text-text-light">שיא רצף</p>
            </div>
          </div>
        </motion.div>

        {/* Next Milestones */}
        {nextMilestones.length > 0 && (
          <motion.div
            className="card-storybook p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="font-bold font-heading text-lg text-text-dark mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sunshine" />
              ההישגים הבאים
            </h2>
            
            <div className="space-y-2">
              {nextMilestones.map((milestone, index) => (
                <motion.div
                  key={milestone.key}
                  className="flex items-center gap-3 bg-cream-100 rounded-xl p-3 border border-cream-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <span className="text-2xl grayscale opacity-50">{milestone.emoji}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-text-dark">{milestone.nameHe}</h4>
                    <p className="text-xs text-text-light">{milestone.descriptionHe}</p>
                  </div>
                  <Zap className="w-4 h-4 text-garden-green opacity-60" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Available Topics - Book covers style */}
        <motion.div
          className="card-storybook p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="font-bold font-heading text-lg text-text-dark mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-story-blue" />
            נושאים ללמידה
          </h2>
          
          <div className="grid grid-cols-4 gap-2">
            {LESSON_TOPICS.slice(0, 8).map((topic, index) => {
              const colors = topicColors[topic.id] || { bg: "bg-cream-200", hover: "hover:bg-cream-300" };
              return (
                <motion.button
                  key={topic.id}
                  onClick={() => router.push(`/lesson?topic=${topic.id}`)}
                  className={`
                    relative p-3 rounded-xl ${colors.bg} ${colors.hover}
                    shadow-warm overflow-hidden transition-colors
                    border-2 border-white/50
                  `}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                >
                  <span className="text-2xl block text-center">{topic.emoji}</span>
                  <p className="text-xs font-medium text-center mt-1 text-text-dark truncate">{topic.hebrewLabel}</p>
                </motion.button>
              );
            })}
          </div>
          
          <motion.button
            onClick={() => router.push("/topics")}
            className="w-full mt-3 py-2 text-garden-green-dark font-medium text-sm hover:underline"
            whileTap={{ scale: 0.98 }}
          >
            עוד נושאים ← 
          </motion.button>
        </motion.div>

        {/* Earned Achievements */}
        {progress?.achievements && progress.achievements.length > 0 && (
          <motion.div
            className="card-storybook p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold font-heading text-lg text-text-dark flex items-center gap-2">
                <Trophy className="w-5 h-5 text-sunshine-dark" />
                ההישגים שלי
              </h2>
              <button 
                className="text-sm text-garden-green-dark font-medium hover:underline"
              >
                לכולם
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {progress.achievements.slice(0, 6).map((key) => {
                const achievement = ACHIEVEMENTS[key];
                if (!achievement) return null;
                return (
                  <motion.div
                    key={key}
                    className="flex items-center gap-2 bg-sunshine-50 rounded-full px-3 py-1.5 border border-sunshine-200"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-lg">{achievement.emoji}</span>
                    <span className="text-sm font-medium text-text-dark">{achievement.nameHe}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Switch Child Button */}
        <motion.button
          onClick={() => router.push("/children")}
          className="w-full btn-outline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          החלפת ילד/ה 👤
        </motion.button>
      </div>
    </PageContainer>
  );
}
