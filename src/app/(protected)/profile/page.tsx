"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  User, Star, Flame, Trophy, BookOpen, Settings,
  LogOut, ChevronLeft, Calendar, Clock
} from "lucide-react";
import { signOut } from "next-auth/react";
import { PageContainer } from "@/components/navigation";
import { ACHIEVEMENTS, getLevelForStars, LEVELS, type Level } from "@/lib/gamification/constants";

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
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <motion.span
          className="text-6xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          👤
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
        {/* Profile Header */}
        <motion.div
          className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-3xl p-6 text-white text-center relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Background sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-white/20"
                style={{ top: `${20 + i * 15}%`, left: `${10 + i * 18}%` }}
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                ✨
              </motion.div>
            ))}
          </div>

          <motion.div
            className="w-24 h-24 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-5xl shadow-lg"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {child.avatar}
          </motion.div>

          <h1 className="text-2xl font-bold mb-1">{child.name}</h1>
          
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">{level.emoji}</span>
            <span className="font-medium">{level.nameHe}</span>
            <span className="text-white/70">• רמה {level.level}</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold text-gray-800">{child.stars}</p>
            <p className="text-sm text-gray-500">כוכבים</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold text-gray-800">{child.currentStreak}</p>
            <p className="text-sm text-gray-500">ימי רצף</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold text-gray-800">{child.totalLessons}</p>
            <p className="text-sm text-gray-500">שיעורים</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold text-gray-800">{progress?.achievements.length || 0}</p>
            <p className="text-sm text-gray-500">הישגים</p>
          </div>
        </motion.div>

        {/* Achievements Section */}
        {progress?.achievements && progress.achievements.length > 0 && (
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              ההישגים שלי
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {progress.achievements.map((key) => {
                const achievement = ACHIEVEMENTS[key];
                if (!achievement) return null;
                return (
                  <motion.div
                    key={key}
                    className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-3 text-center border border-amber-200"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-2xl block mb-1">{achievement.emoji}</span>
                    <span className="text-xs font-medium text-amber-800">{achievement.nameHe}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Level Progress */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-bold text-lg text-gray-800 mb-3">מסע הרמות</h2>
          
          <div className="space-y-2">
            {LEVELS.filter((_, i) => i < 10).map((lvl, index) => {
              const isUnlocked = child.stars >= lvl.starsRequired;
              const isCurrent = level.level === lvl.level;
              
              return (
                <div
                  key={lvl.level}
                  className={`
                    flex items-center gap-3 p-2 rounded-xl transition-colors
                    ${isCurrent ? "bg-purple-100 border-2 border-purple-400" : ""}
                    ${isUnlocked ? "" : "opacity-50"}
                  `}
                >
                  <span className={`text-2xl ${isUnlocked ? "" : "grayscale"}`}>
                    {lvl.emoji}
                  </span>
                  <div className="flex-1">
                    <p className={`font-medium ${isCurrent ? "text-purple-700" : "text-gray-700"}`}>
                      {lvl.nameHe}
                    </p>
                    <p className="text-xs text-gray-500">
                      {lvl.starsRequired} ⭐
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
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
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span>התחלנו ביחד ב-{memberSince.toLocaleDateString("he-IL")}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600 mt-2">
            <Flame className="w-5 h-5" />
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
            className="w-full flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:bg-white/90 transition-colors"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">החלפת ילד/ה</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:bg-red-50 transition-colors text-red-600"
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
