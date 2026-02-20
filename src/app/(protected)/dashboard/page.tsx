"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Star, Flame, Trophy, BookOpen, Gamepad2, 
  ChevronLeft, Sparkles, Target, Users
} from "lucide-react";
import { PageContainer } from "@/components/navigation";
import { getLevelForStars, getNextLevel, ACHIEVEMENTS } from "@/lib/gamification/constants";

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
  levelProgress: number;
  starsToNextLevel: number;
  currentStreak: number;
  achievements: string[];
}

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-lily flex items-center justify-center shadow-lg"
            animate={{ 
              y: [0, -8, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-4xl">🌸</span>
          </motion.div>
          <p className="text-lg font-bold text-gray-700">טוען...</p>
        </motion.div>
      </div>
    );
  }

  if (!child) {
    router.push("/children");
    return null;
  }

  return (
    <PageContainer showTopNav={false} showBottomNav={true}>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        
        {/* ═══════════════════════════════════════════════════════════════════
            HERO HEADER
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-lily p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 right-2 text-5xl">🌸</div>
            <div className="absolute bottom-2 left-2 text-4xl">✨</div>
          </div>
          
          <div className="relative z-10 flex items-center gap-4">
            {/* Avatar */}
            <motion.div
              className="w-20 h-20 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-md"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-4xl">{child.avatar}</span>
            </motion.div>
            
            <div className="flex-1 text-white">
              <h1 className="text-2xl font-bold mb-1">
                שלום, {child.name}! 👋
              </h1>
              <div className="flex items-center gap-2 opacity-90">
                <span className="text-xl">{level?.emoji}</span>
                <span className="font-medium">{level?.nameHe}</span>
                <span className="opacity-70">• רמה {level?.level}</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="relative z-10 flex items-center justify-between mt-5 pt-4 border-t border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-gold" fill="currentColor" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{child.stars}</p>
                <p className="text-xs text-white/70">כוכבים</p>
              </div>
            </div>
            
            <div className="h-8 w-px bg-white/20" />
            
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-300" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{child.currentStreak}</p>
                <p className="text-xs text-white/70">ימים</p>
              </div>
            </div>
            
            <div className="h-8 w-px bg-white/20" />
            
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{progress?.achievements?.length || 0}</p>
                <p className="text-xs text-white/70">הישגים</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            LEVEL PROGRESS
        ═══════════════════════════════════════════════════════════════════ */}
        {level && (
          <motion.div
            className="bg-white rounded-2xl p-5 shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gold-light flex items-center justify-center">
                  <span className="text-2xl">{level.emoji}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{level.nameHe}</h3>
                  <p className="text-sm text-gray-500">רמה {level.level}</p>
                </div>
              </div>
              
              {nextLevel && (
                <div className="flex items-center gap-2 text-gray-400">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-xl">{nextLevel.emoji}</span>
                </div>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="relative">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-green rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                />
              </div>
              <p className="text-center text-sm font-medium text-gray-600 mt-2">
                {starsToNext > 0 ? (
                  <>עוד <span className="text-green font-bold">{starsToNext}</span> ⭐ לרמה הבאה</>
                ) : (
                  <span className="text-green">🎉 הגעת לרמה הגבוהה!</span>
                )}
              </p>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MAIN ACTIONS
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Start Lesson */}
          <motion.button
            onClick={() => router.push("/topics")}
            className="relative overflow-hidden bg-green rounded-2xl p-5 text-white text-right shadow-md"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute top-3 left-3 opacity-20">
              <BookOpen className="w-14 h-14" />
            </div>
            <div className="relative z-10">
              <span className="text-3xl block mb-2">📚</span>
              <h3 className="text-lg font-bold mb-1">להתחיל שיעור</h3>
              <p className="text-sm opacity-80">בחרי נושא חדש</p>
            </div>
          </motion.button>

          {/* Games */}
          <motion.button
            onClick={() => router.push("/games")}
            className="relative overflow-hidden bg-sky rounded-2xl p-5 text-white text-right shadow-md"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute top-3 left-3 opacity-20">
              <Gamepad2 className="w-14 h-14" />
            </div>
            <div className="relative z-10">
              <span className="text-3xl block mb-2">🎮</span>
              <h3 className="text-lg font-bold mb-1">משחקים</h3>
              <p className="text-sm opacity-80">תרגול כייפי</p>
            </div>
          </motion.button>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            STATS GRID
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          className="bg-white rounded-2xl p-5 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green" />
            ההתקדמות שלי
          </h2>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <span className="text-2xl block mb-1">📖</span>
              <p className="text-2xl font-bold text-gray-800">{child.totalLessons}</p>
              <p className="text-xs text-gray-500 font-medium">שיעורים</p>
            </div>
            
            <div className="bg-lily-50 rounded-xl p-4 text-center">
              <span className="text-2xl block mb-1">🔤</span>
              <p className="text-2xl font-bold text-gray-800">{child.totalWordsLearned}</p>
              <p className="text-xs text-gray-500 font-medium">מילים</p>
            </div>
            
            <div className="bg-gold-50 rounded-xl p-4 text-center">
              <span className="text-2xl block mb-1">🔥</span>
              <p className="text-2xl font-bold text-gray-800">{child.longestStreak}</p>
              <p className="text-xs text-gray-500 font-medium">שיא רצף</p>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            NEXT ACHIEVEMENTS
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          className="bg-white rounded-2xl p-5 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            ההישגים הבאים
          </h2>
          
          <div className="space-y-3">
            {Object.entries(ACHIEVEMENTS)
              .filter(([key]) => !progress?.achievements?.includes(key))
              .slice(0, 3)
              .map(([key, achievement], index) => (
                <motion.div
                  key={key}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                    <span className="text-xl grayscale opacity-50">{achievement.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-sm">{achievement.nameHe}</h4>
                    <p className="text-xs text-gray-500">{achievement.descriptionHe}</p>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            SWITCH CHILD
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.button
          onClick={() => router.push("/children")}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-white hover:bg-gray-50 rounded-2xl border-2 border-gray-200 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.98 }}
        >
          <Users className="w-5 h-5 text-gray-500" />
          <span className="font-bold text-gray-600">החלפת ילד/ה</span>
        </motion.button>
        
      </div>
    </PageContainer>
  );
}
