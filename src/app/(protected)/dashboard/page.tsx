"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, Flame, Trophy, BookOpen, Gamepad2, 
  ChevronLeft, Sparkles, Target, Clock, Zap
} from "lucide-react";
import { PageContainer } from "@/components/navigation";
import { StarsDisplay } from "@/components/gamification/StarsDisplay";
import { StreakDisplay } from "@/components/gamification/StreakDisplay";
import { LevelProgress } from "@/components/gamification/LevelProgress";
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

const topicGradients: Record<string, string> = {
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

export default function DashboardPage() {
  const router = useRouter();
  const [child, setChild] = useState<ChildData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAchievements, setShowAchievements] = useState(false);

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
        .map(([key, achievement]) => achievement)
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.span
            className="text-6xl block mb-4"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🧚
          </motion.span>
          <p className="text-purple-600 font-medium">טוען...</p>
        </motion.div>
      </div>
    );
  }

  if (!child) {
    return null;
  }

  return (
    <PageContainer
      showBack={true}
      showBottomNav={true}
      showTopNav={false}
    >
      <div className="max-w-lg mx-auto space-y-4 pb-4">
        {/* Hero Header */}
        <motion.div
          className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-3xl p-6 text-white overflow-hidden shadow-xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Sparkle decorations */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-white/30 text-lg"
                style={{
                  top: `${15 + i * 18}%`,
                  left: `${10 + i * 20}%`,
                }}
                animate={{ 
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                ✨
              </motion.div>
            ))}
          </div>

          {/* User info */}
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl shadow-lg backdrop-blur-sm"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {child.avatar}
              </motion.div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold font-heading mb-1">
                  שלום, {child.name}! 👋
                </h1>
                <div className="flex items-center gap-2 text-white/90">
                  <span className="text-xl">{level?.emoji}</span>
                  <span className="font-medium">{level?.nameHe}</span>
                  <span className="text-white/70">רמה {level?.level}</span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-2xl p-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="font-bold">{child.stars}</span>
              </div>
              <div className="h-6 w-px bg-white/30" />
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-300" />
                <span className="font-bold">{child.currentStreak} ימים</span>
              </div>
              <div className="h-6 w-px bg-white/30" />
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-300" />
                <span className="font-bold">{progress?.achievements.length || 0}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Level Progress Card */}
        {level && (
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{level.emoji}</span>
                <div>
                  <h3 className="font-bold text-gray-800">{level.nameHe}</h3>
                  <p className="text-xs text-gray-500">רמה {level.level}</p>
                </div>
              </div>
              {nextLevel && (
                <div className="flex items-center gap-2 text-gray-500">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-xl">{nextLevel.emoji}</span>
                  <span className="text-sm">{nextLevel.nameHe}</span>
                </div>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="relative h-4 bg-purple-100 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-purple-800/80">
                  {starsToNext > 0 ? `עוד ${starsToNext} ⭐ לרמה הבאה` : "🎉"}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={() => router.push("/topics")}
            className="relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute top-2 left-2">
              <BookOpen className="w-8 h-8 opacity-20" />
            </div>
            <div className="relative z-10">
              <span className="text-2xl mb-2 block">📚</span>
              <h3 className="font-bold text-lg">להתחיל שיעור</h3>
              <p className="text-sm text-white/80">בחרי נושא חדש</p>
            </div>
          </motion.button>

          <motion.button
            onClick={() => router.push("/games")}
            className="relative bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-4 text-white shadow-lg overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute top-2 left-2">
              <Gamepad2 className="w-8 h-8 opacity-20" />
            </div>
            <div className="relative z-10">
              <span className="text-2xl mb-2 block">🎮</span>
              <h3 className="font-bold text-lg">משחקים</h3>
              <p className="text-sm text-white/80">תרגול כייפי</p>
            </div>
          </motion.button>
        </motion.div>

        {/* My Progress Section */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            ההתקדמות שלי
          </h2>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <span className="text-2xl block mb-1">📖</span>
              <p className="text-2xl font-bold text-purple-700">{child.totalLessons}</p>
              <p className="text-xs text-gray-500">שיעורים</p>
            </div>
            <div className="bg-pink-50 rounded-xl p-3 text-center">
              <span className="text-2xl block mb-1">🔤</span>
              <p className="text-2xl font-bold text-pink-700">{child.totalWordsLearned}</p>
              <p className="text-xs text-gray-500">מילים</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <span className="text-2xl block mb-1">🔥</span>
              <p className="text-2xl font-bold text-amber-700">{child.longestStreak}</p>
              <p className="text-xs text-gray-500">שיא רצף</p>
            </div>
          </div>
        </motion.div>

        {/* Next Milestones */}
        {nextMilestones.length > 0 && (
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              ההישגים הבאים
            </h2>
            
            <div className="space-y-2">
              {nextMilestones.map((milestone, index) => (
                <motion.div
                  key={milestone.key}
                  className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <span className="text-2xl grayscale opacity-50">{milestone.emoji}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-700">{milestone.nameHe}</h4>
                    <p className="text-xs text-gray-500">{milestone.descriptionHe}</p>
                  </div>
                  <Zap className="w-4 h-4 text-purple-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Available Topics */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-500" />
            נושאים ללמידה
          </h2>
          
          <div className="grid grid-cols-4 gap-2">
            {LESSON_TOPICS.slice(0, 8).map((topic, index) => (
              <motion.button
                key={topic.id}
                onClick={() => router.push(`/lesson?topic=${topic.id}`)}
                className={`
                  relative p-3 rounded-xl bg-gradient-to-br ${topicGradients[topic.id]}
                  text-white shadow-md overflow-hidden
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.05 }}
              >
                <span className="text-2xl block text-center">{topic.emoji}</span>
                <p className="text-xs font-medium text-center mt-1 truncate">{topic.hebrewLabel}</p>
              </motion.button>
            ))}
          </div>
          
          <motion.button
            onClick={() => router.push("/topics")}
            className="w-full mt-3 py-2 text-purple-600 font-medium text-sm hover:underline"
            whileTap={{ scale: 0.98 }}
          >
            עוד נושאים ← 
          </motion.button>
        </motion.div>

        {/* Earned Achievements */}
        {progress?.achievements && progress.achievements.length > 0 && (
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                ההישגים שלי
              </h2>
              <button 
                onClick={() => setShowAchievements(true)}
                className="text-sm text-purple-600 font-medium"
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
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-full px-3 py-1.5 border border-amber-200"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-lg">{achievement.emoji}</span>
                    <span className="text-sm font-medium text-amber-800">{achievement.nameHe}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Switch Child Button */}
        <motion.button
          onClick={() => router.push("/children")}
          className="w-full py-3 bg-white/60 backdrop-blur-sm rounded-xl text-gray-600 font-medium border border-purple-100 hover:bg-white/80 transition-colors"
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
