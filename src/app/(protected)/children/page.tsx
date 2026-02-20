"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LogOut, Clock, Star, Flame, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { CHILD_AVATARS } from "@/lib/constants";

type Child = {
  id: string;
  name: string;
  avatar: string;
  stars: number;
  currentStreak: number;
  lastActivityDate: string | null;
  totalLessons: number;
};

// Avatar colors - vibrant but harmonious
const avatarThemes: Record<string, { gradient: string; bg: string }> = {
  "🦄": { gradient: "from-fuchsia-400 to-purple-500", bg: "bg-fuchsia-100" },
  "🐱": { gradient: "from-amber-400 to-orange-500", bg: "bg-amber-100" },
  "🐼": { gradient: "from-slate-400 to-slate-600", bg: "bg-slate-100" },
  "⭐": { gradient: "from-yellow-400 to-amber-500", bg: "bg-yellow-100" },
  "🦋": { gradient: "from-cyan-400 to-blue-500", bg: "bg-cyan-100" },
  "🐰": { gradient: "from-pink-400 to-rose-500", bg: "bg-pink-100" },
  "🌈": { gradient: "from-green-400 to-emerald-500", bg: "bg-green-100" },
  "🐶": { gradient: "from-orange-400 to-amber-500", bg: "bg-orange-100" },
};

function formatLastActivity(dateStr: string | null): string {
  if (!dateStr) return "מוכן להתחיל!";
  
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "עכשיו";
  if (diffMins < 60) return `לפני ${diffMins} דקות`;
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays === 1) return "אתמול";
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  
  return date.toLocaleDateString("he-IL", { day: "numeric", month: "short" });
}

export default function ChildrenPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAvatar, setNewChildAvatar] = useState("⭐");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  async function fetchChildren() {
    try {
      const res = await fetch("/api/children");
      if (res.ok) {
        const data = await res.json();
        setChildren(data.children);
      }
    } catch (error) {
      console.error("Failed to fetch children:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateChild(e: React.FormEvent) {
    e.preventDefault();
    if (!newChildName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newChildName, avatar: newChildAvatar }),
      });

      if (res.ok) {
        const data = await res.json();
        setChildren([...children, { ...data.child, lastActivityDate: null, totalLessons: 0 }]);
        setShowAddModal(false);
        setNewChildName("");
        setNewChildAvatar("⭐");
      }
    } catch (error) {
      console.error("Failed to create child:", error);
    } finally {
      setIsCreating(false);
    }
  }

  function handleSelectChild(childId: string) {
    localStorage.setItem("selectedChildId", childId);
    const child = children.find(c => c.id === childId);
    if (child) {
      localStorage.setItem("english-learner-onboarding", JSON.stringify({
        childName: child.name,
        avatar: child.avatar,
      }));
    }
    router.push("/dashboard");
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-cream-50 via-cream to-cream-200 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-garden-green to-garden-green-dark flex items-center justify-center shadow-xl"
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
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream-50 via-cream to-cream-200 px-4 py-8">
      <div className="max-w-lg mx-auto">
        
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-text-dark mb-1">מי לומד היום?</h1>
            <p className="text-lg text-garden-green-dark font-medium">בחרו פרופיל להמשיך 🌟</p>
          </div>
          <motion.button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-md border border-cream-200 text-text-light hover:text-text-dark hover:bg-cream-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="התנתקות"
          >
            <LogOut className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Children Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {children.map((child, index) => {
            const theme = avatarThemes[child.avatar] || { gradient: "from-gray-400 to-gray-500", bg: "bg-gray-100" };
            
            return (
              <motion.button
                key={child.id}
                onClick={() => handleSelectChild(child.id)}
                className="relative bg-white rounded-2xl p-5 shadow-lg border border-cream-200 overflow-hidden text-center"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Gradient top decoration */}
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${theme.gradient}`} />
                
                {/* Avatar */}
                <motion.div 
                  className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-lg`}
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-4xl">{child.avatar}</span>
                </motion.div>
                
                {/* Name */}
                <h3 className="text-xl font-bold text-text-dark mb-2">{child.name}</h3>
                
                {/* Stats */}
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-sunshine" fill="currentColor" />
                    <span className="text-sm font-bold text-text-dark">{child.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-bold text-text-dark">{child.currentStreak}</span>
                  </div>
                </div>
                
                {/* Last activity */}
                <div className="flex items-center justify-center gap-1 text-xs text-text-light bg-cream-100 rounded-full py-1 px-3">
                  <Clock className="w-3 h-3" />
                  <span>{formatLastActivity(child.lastActivityDate)}</span>
                </div>
              </motion.button>
            );
          })}

          {/* Add Child Button */}
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center justify-center p-5 rounded-2xl border-3 border-dashed border-garden-green-light bg-garden-green-50/50 hover:bg-garden-green-light/30 transition-colors min-h-[200px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: children.length * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-16 h-16 mb-4 rounded-2xl bg-garden-green-light flex items-center justify-center">
              <Plus className="w-8 h-8 text-garden-green-dark" />
            </div>
            <h3 className="text-lg font-bold text-garden-green-dark">הוספת ילד/ה</h3>
            <p className="text-sm text-garden-green mt-1">ליצור פרופיל חדש</p>
          </motion.button>
        </div>

        {/* Bottom decoration */}
        <motion.div 
          className="text-center text-4xl opacity-30 mt-8"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🌸 🌿 🦋
        </motion.div>
      </div>

      {/* Add Child Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-cream-100 hover:bg-cream-200 transition-colors"
              >
                <X className="w-5 h-5 text-text-light" />
              </button>
              
              <div className="text-center mb-6">
                <span className="text-5xl block mb-3">🌟</span>
                <h2 className="text-2xl font-bold text-text-dark">הוספת ילד/ה</h2>
                <p className="text-text-light">יוצרים פרופיל חדש</p>
              </div>
              
              <form onSubmit={handleCreateChild} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-text-dark mb-2 text-right">
                    שם הילד/ה
                  </label>
                  <input
                    type="text"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 bg-cream-50 text-lg text-right focus:outline-none focus:border-garden-green focus:ring-2 focus:ring-garden-green/20 transition-all"
                    placeholder="הכניסו שם..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-dark mb-3 text-right">
                    בחירת דמות
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {CHILD_AVATARS.map((avatar) => {
                      const theme = avatarThemes[avatar.emoji] || { gradient: "from-gray-400 to-gray-500", bg: "bg-gray-100" };
                      const isSelected = newChildAvatar === avatar.emoji;
                      return (
                        <motion.button
                          key={avatar.emoji}
                          type="button"
                          onClick={() => setNewChildAvatar(avatar.emoji)}
                          className={`
                            relative p-3 rounded-xl transition-all border-3
                            ${isSelected
                              ? `bg-gradient-to-br ${theme.gradient} border-transparent shadow-lg`
                              : `${theme.bg} border-transparent hover:border-cream-300`
                            }
                          `}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="text-3xl block">{avatar.emoji}</span>
                          {isSelected && (
                            <motion.div
                              className="absolute -top-1 -right-1 w-6 h-6 bg-garden-green rounded-full flex items-center justify-center shadow-md"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <span className="text-white text-xs">✓</span>
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 px-6 rounded-xl font-bold text-text-medium bg-cream-100 hover:bg-cream-200 transition-colors"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !newChildName.trim()}
                    className="flex-1 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-garden-green to-garden-green-dark shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isCreating ? "יוצר..." : "הוספה 🌸"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
