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
      <div className="min-h-screen bg-gradient-to-b from-cream-50 via-cream to-cream-200 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-lily-pink to-lily-pink-dark flex items-center justify-center shadow-xl"
            animate={{ 
              y: [0, -8, 0],
              rotate: [0, 3, -3, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-5xl">🌸</span>
          </motion.div>
          <p className="text-xl font-bold text-text-dark">טוען...</p>
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
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        
        {/* ═══════════════════════════════════════════════════════════════════
            HERO HEADER - The star of the show
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-garden-green via-garden-green to-garden-green-dark p-6 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 text-6xl">🌿</div>
            <div className="absolute bottom-4 right-4 text-5xl">🌸</div>
            <div className="absolute top-1/2 right-8 text-4xl">✨</div>
          </div>
          
          <div className="relative z-10 flex items-center gap-5">
            {/* Large Avatar */}
            <motion.div
              className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/30"
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-5xl">{child.avatar}</span>
            </motion.div>
            
            <div className="flex-1 text-white">
              <motion.h1 
                className="text-3xl font-bold mb-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                שלום, {child.name}! 👋
              </motion.h1>
              <div className="flex items-center gap-2 opacity-90">
                <span className="text-2xl">{level?.emoji}</span>
                <span className="text-lg font-medium">{level?.nameHe}</span>
                <span className="text-white/70">• רמה {level?.level}</span>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <motion.div 
            className="relative z-10 flex items-center justify-between mt-6 pt-5 border-t border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-sunshine" fill="currentColor" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{child.stars}</p>
                <p className="text-xs text-white/70">כוכבים</p>
              </div>
            </div>
            
            <div className="h-10 w-px bg-white/20" />
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{child.currentStreak}</p>
                <p className="text-xs text-white/70">ימים ברצף</p>
              </div>
            </div>
            
            <div className="h-10 w-px bg-white/20" />
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-sunshine" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{progress?.achievements?.length || 0}</p>
                <p className="text-xs text-white/70">הישגים</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            LEVEL PROGRESS - Clear visual feedback
        ═══════════════════════════════════════════════════════════════════ */}
        {level && (
          <motion.div
            className="bg-white rounded-2xl p-5 shadow-lg border border-cream-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-sunshine-light flex items-center justify-center">
                  <span className="text-3xl">{level.emoji}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-dark">{level.nameHe}</h3>
                  <p className="text-sm text-text-light">רמה {level.level}</p>
                </div>
              </div>
              
              {nextLevel && (
                <div className="flex items-center gap-2 text-text-light">
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-2xl">{nextLevel.emoji}</span>
                </div>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="relative">
              <div className="h-4 bg-cream-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-garden-green to-garden-green-dark rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                />
              </div>
              <p className="text-center text-sm font-medium text-text-medium mt-2">
                {starsToNext > 0 ? (
                  <>עוד <span className="text-garden-green font-bold">{starsToNext}</span> ⭐ לרמה הבאה</>
                ) : (
                  <span className="text-garden-green">🎉 הגעת לרמה הגבוהה!</span>
                )}
              </p>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MAIN ACTIONS - Big, clear, inviting
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Start Lesson - Primary Action */}
          <motion.button
            onClick={() => router.push("/topics")}
            className="relative overflow-hidden bg-gradient-to-br from-lily-pink to-lily-pink-dark rounded-2xl p-5 text-white text-right shadow-lg"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute top-3 left-3 opacity-20">
              <BookOpen className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <span className="text-4xl block mb-3">📚</span>
              <h3 className="text-xl font-bold mb-1">להתחיל שיעור</h3>
              <p className="text-sm opacity-80">בחרי נושא חדש</p>
            </div>
          </motion.button>

          {/* Games - Secondary Action */}
          <motion.button
            onClick={() => router.push("/games")}
            className="relative overflow-hidden bg-gradient-to-br from-story-blue to-story-blue-dark rounded-2xl p-5 text-white text-right shadow-lg"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute top-3 left-3 opacity-20">
              <Gamepad2 className="w-16 h-16" />
            </div>
            <div className="relative z-10">
              <span className="text-4xl block mb-3">🎮</span>
              <h3 className="text-xl font-bold mb-1">משחקים</h3>
              <p className="text-sm opacity-80">תרגול כייפי</p>
            </div>
          </motion.button>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            STATS GRID - Clean, scannable
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          className="bg-white rounded-2xl p-5 shadow-lg border border-cream-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-garden-green" />
            ההתקדמות שלי
          </h2>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-cream-50 to-cream-100 rounded-xl p-4 text-center">
              <span className="text-3xl block mb-2">📖</span>
              <p className="text-3xl font-bold text-garden-green">{child.totalLessons}</p>
              <p className="text-xs text-text-light font-medium">שיעורים</p>
            </div>
            
            <div className="bg-gradient-to-br from-lily-pink-50 to-lily-pink-100 rounded-xl p-4 text-center">
              <span className="text-3xl block mb-2">🔤</span>
              <p className="text-3xl font-bold text-lily-pink-dark">{child.totalWordsLearned}</p>
              <p className="text-xs text-text-light font-medium">מילים</p>
            </div>
            
            <div className="bg-gradient-to-br from-sunshine-50 to-sunshine-100 rounded-xl p-4 text-center">
              <span className="text-3xl block mb-2">🔥</span>
              <p className="text-3xl font-bold text-sunshine-dark">{child.longestStreak}</p>
              <p className="text-xs text-text-light font-medium">שיא רצף</p>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            NEXT ACHIEVEMENTS - Aspirational
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.div
          className="bg-white rounded-2xl p-5 shadow-lg border border-cream-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sunshine" />
            ההישגים הבאים
          </h2>
          
          <div className="space-y-3">
            {Object.entries(ACHIEVEMENTS)
              .filter(([key]) => !progress?.achievements?.includes(key))
              .slice(0, 3)
              .map(([key, achievement], index) => (
                <motion.div
                  key={key}
                  className="flex items-center gap-4 p-3 bg-cream-50 rounded-xl border border-cream-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-cream-200 flex items-center justify-center">
                    <span className="text-2xl grayscale opacity-60">{achievement.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-text-dark">{achievement.nameHe}</h4>
                    <p className="text-sm text-text-light">{achievement.descriptionHe}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-garden-green-light flex items-center justify-center">
                    <span className="text-garden-green text-lg">⚡</span>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            SWITCH CHILD - Secondary action
        ═══════════════════════════════════════════════════════════════════ */}
        <motion.button
          onClick={() => router.push("/children")}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-cream-100 hover:bg-cream-200 rounded-2xl border-2 border-cream-300 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.98 }}
        >
          <Users className="w-5 h-5 text-text-medium" />
          <span className="font-bold text-text-medium">החלפת ילד/ה</span>
        </motion.button>
        
      </div>
    </PageContainer>
  );
}
