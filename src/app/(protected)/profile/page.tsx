"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  User, Star, Flame, Trophy, BookOpen,
  LogOut, ChevronLeft, Calendar
} from "lucide-react";
import { signOut } from "next-auth/react";
import { PageContainer } from "@/components/navigation";
import { ACHIEVEMENTS, getLevelForStars, LEVELS } from "@/lib/gamification/constants";

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
  createdAt: string;
}

interface ProgressData {
  achievements: string[];
}

export default function ProfilePage() {
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
    
    fetchData(childId);
  }, [router]);

  async function fetchData(childId: string) {
    try {
      const [childRes, progressRes] = await Promise.all([
        fetch(`/api/child/${childId}`),
        fetch(`/api/gamification/progress/${childId}`),
      ]);

      if (childRes.ok) {
        const data = await childRes.json();
        setChild(data.child);
      }

      if (progressRes.ok) {
        const data = await progressRes.json();
        setProgress(data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-storybook flex items-center justify-center">
        <motion.span
          className="text-6xl"
          animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🌸
        </motion.span>
      </div>
    );
  }

  if (!child) return null;

  const level = getLevelForStars(child.stars);
  const memberSince = new Date(child.createdAt);

  return (
    <PageContainer title="פרופיל">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Profile Header - Storybook character card */}
        <motion.div
          className="card-storybook p-6 text-center relative overflow-hidden border-3 border-wood-light"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Corner decorations */}
          <div className="absolute top-2 left-2 text-xl opacity-30">🌿</div>
          <div className="absolute top-2 right-2 text-xl opacity-30">🌸</div>

          <motion.div
            className="w-24 h-24 mx-auto mb-4 bg-sunshine-light rounded-3xl flex items-center justify-center text-5xl shadow-warm border-3 border-sunshine"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {child.avatar}
          </motion.div>

          <h1 className="text-2xl font-bold font-heading text-text-dark mb-1">{child.name}</h1>
          
          <div className="flex items-center justify-center gap-2 text-text-medium">
            <span className="text-2xl">{level.emoji}</span>
            <span className="font-medium">{level.nameHe}</span>
            <span className="text-text-light">• רמה {level.level}</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-storybook p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-sunshine-dark" />
            <p className="text-2xl font-bold text-text-dark">{child.stars}</p>
            <p className="text-sm text-text-light">כוכבים</p>
          </div>

          <div className="card-storybook p-4 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-lily-pink-dark" />
            <p className="text-2xl font-bold text-text-dark">{child.currentStreak}</p>
            <p className="text-sm text-text-light">ימי רצף</p>
          </div>

          <div className="card-storybook p-4 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-garden-green" />
            <p className="text-2xl font-bold text-text-dark">{child.totalLessons}</p>
            <p className="text-sm text-text-light">שיעורים</p>
          </div>

          <div className="card-storybook p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-sunshine-dark" />
            <p className="text-2xl font-bold text-text-dark">{progress?.achievements.length || 0}</p>
            <p className="text-sm text-text-light">הישגים</p>
          </div>
        </motion.div>

        {/* Achievements Section */}
        {progress?.achievements && progress.achievements.length > 0 && (
          <motion.div
            className="card-storybook p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-bold font-heading text-lg text-text-dark mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-sunshine-dark" />
              ההישגים שלי
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {progress.achievements.map((key) => {
                const achievement = ACHIEVEMENTS[key];
                if (!achievement) return null;
                return (
                  <motion.div
                    key={key}
                    className="bg-sunshine-50 rounded-xl p-3 text-center border border-sunshine-200"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-2xl block mb-1">{achievement.emoji}</span>
                    <span className="text-xs font-medium text-text-dark">{achievement.nameHe}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Level Progress */}
        <motion.div
          className="card-storybook p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-bold font-heading text-lg text-text-dark mb-3">מסע הרמות</h2>
          
          <div className="space-y-2">
            {LEVELS.filter((_, i) => i < 10).map((lvl) => {
              const isUnlocked = child.stars >= lvl.starsRequired;
              const isCurrent = level.level === lvl.level;
              
              return (
                <div
                  key={lvl.level}
                  className={`
                    flex items-center gap-3 p-2 rounded-xl transition-colors
                    ${isCurrent ? "bg-garden-green-light border-2 border-garden-green" : ""}
                    ${isUnlocked ? "" : "opacity-50"}
                  `}
                >
                  <span className={`text-2xl ${isUnlocked ? "" : "grayscale"}`}>
                    {lvl.emoji}
                  </span>
                  <div className="flex-1">
                    <p className={`font-medium ${isCurrent ? "text-garden-green-dark" : "text-text-dark"}`}>
                      {lvl.nameHe}
                    </p>
                    <p className="text-xs text-text-light">
                      {lvl.starsRequired} ⭐
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="text-xs bg-garden-green text-white px-2 py-1 rounded-full">
                      עכשיו
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          className="card-storybook p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 text-text-medium">
            <Calendar className="w-5 h-5 text-story-blue" />
            <span>התחלנו ביחד ב-{memberSince.toLocaleDateString("he-IL")}</span>
          </div>
          <div className="flex items-center gap-3 text-text-medium mt-2">
            <Flame className="w-5 h-5 text-lily-pink" />
            <span>שיא רצף: {child.longestStreak} ימים</span>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => router.push("/children")}
            className="w-full flex items-center justify-between p-4 card-storybook hover:bg-cream-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-text-medium" />
              <span className="font-medium text-text-dark">החלפת ילד/ה</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-text-light" />
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-between p-4 card-storybook hover:bg-lily-pink-50 transition-colors text-lily-pink-dark"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">התנתקות</span>
            </div>
          </button>
        </motion.div>
      </div>
    </PageContainer>
  );
}
