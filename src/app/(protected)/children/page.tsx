"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LogOut, Clock } from "lucide-react";
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

// Storybook-themed avatar backgrounds
const avatarColors: Record<string, { bg: string; border: string }> = {
  "🦄": { bg: "bg-lily-pink-light", border: "border-lily-pink" },
  "🐱": { bg: "bg-sunshine-light", border: "border-sunshine" },
  "🐼": { bg: "bg-cream-200", border: "border-wood-light" },
  "⭐": { bg: "bg-sunshine-light", border: "border-sunshine" },
  "🦋": { bg: "bg-story-blue-light", border: "border-story-blue" },
  "🐰": { bg: "bg-lily-pink-light", border: "border-lily-pink" },
  "🌈": { bg: "bg-garden-green-light", border: "border-garden-green" },
  "🐶": { bg: "bg-sunshine-light", border: "border-sunshine-dark" },
};

function formatLastActivity(dateStr: string | null): string {
  if (!dateStr) return "חדש!";
  
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
    // Save selected child to localStorage and go to dashboard (main hub)
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
      <main className="min-h-screen bg-storybook flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.span
            className="text-6xl block"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            🌸
          </motion.span>
          <p className="text-text-light mt-3 font-medium">טוען...</p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-storybook px-4 py-8 relative overflow-hidden">
      {/* Storybook decorations */}
      <div className="storybook-decorations">
        <motion.span
          className="absolute text-3xl opacity-25"
          style={{ top: "10%", left: "5%" }}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          🌿
        </motion.span>
        <motion.span
          className="absolute text-2xl opacity-30"
          style={{ top: "15%", right: "8%" }}
          animate={{ y: [0, -6, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
        >
          🍃
        </motion.span>
        <motion.span
          className="absolute text-3xl opacity-35"
          style={{ bottom: "20%", right: "5%" }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, delay: 1 }}
        >
          🌸
        </motion.span>
        <motion.span
          className="absolute text-2xl opacity-40"
          style={{ bottom: "30%", left: "10%" }}
          animate={{ 
            x: [0, 15, 0], 
            y: [0, -10, 0]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          🦋
        </motion.span>
      </div>

      <div className="vignette" />

      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-heading text-text-dark">מי לומד היום?</h1>
            <p className="text-garden-green-dark font-medium">בחרו פרופיל להמשיך</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2.5 text-text-light hover:text-text-dark hover:bg-cream-200 rounded-full transition-all"
            title="התנתקות"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Children Grid - Storybook character cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {children.map((child, index) => {
            const colors = avatarColors[child.avatar] || { bg: "bg-cream-100", border: "border-wood-light" };
            
            return (
              <motion.button
                key={child.id}
                onClick={() => handleSelectChild(child.id)}
                className="card-character p-5 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Avatar in illustrated frame */}
                <div className={`
                  w-16 h-16 mx-auto mb-3 rounded-2xl 
                  ${colors.bg} ${colors.border} border-3
                  flex items-center justify-center 
                  shadow-warm
                `}>
                  <motion.span 
                    className="text-3xl"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  >
                    {child.avatar}
                  </motion.span>
                </div>
                <h3 className="font-bold font-heading text-text-dark mb-1">{child.name}</h3>
                
                {/* Stats row */}
                <div className="flex items-center justify-center gap-3 text-sm text-text-light mb-2">
                  <span className="flex items-center gap-1">
                    <span>⭐</span> {child.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <span>🔥</span> {child.currentStreak}
                  </span>
                </div>
                
                {/* Last activity */}
                <div className="flex items-center justify-center gap-1 text-xs text-text-light">
                  <Clock className="w-3 h-3" />
                  <span>{formatLastActivity(child.lastActivityDate)}</span>
                </div>
              </motion.button>
            );
          })}

          {/* Add Child Button */}
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl p-5 border-3 border-dashed border-wood-light text-center hover:bg-cream-100 transition-all flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: children.length * 0.1 }}
            whileHover={{ scale: 1.03, borderColor: "var(--wood-brown)" }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="w-16 h-16 mb-3 rounded-2xl bg-cream-200 flex items-center justify-center">
              <Plus className="w-8 h-8 text-garden-green" />
            </div>
            <h3 className="font-medium text-garden-green-dark">הוספת ילד/ה</h3>
          </motion.button>
        </div>
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
            <motion.div 
              className="absolute inset-0 bg-wood-dark/30 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative card-storybook p-6 w-full max-w-sm shadow-warm-xl"
            >
              <h2 className="text-xl font-bold font-heading text-text-dark mb-4 text-center">
                הוספת ילד/ה חדש/ה 🌟
              </h2>
              
              <form onSubmit={handleCreateChild} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1.5 text-right">
                    שם
                  </label>
                  <input
                    type="text"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    className="input-storybook text-right"
                    placeholder="שם הילד/ה"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2 text-right">
                    בחירת דמות
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {CHILD_AVATARS.map((avatar) => {
                      const colors = avatarColors[avatar.emoji] || { bg: "bg-cream-100", border: "border-wood-light" };
                      return (
                        <button
                          key={avatar.emoji}
                          type="button"
                          onClick={() => setNewChildAvatar(avatar.emoji)}
                          className={`
                            p-2.5 rounded-xl transition-all border-2
                            ${newChildAvatar === avatar.emoji
                              ? `${colors.bg} ${colors.border} shadow-warm`
                              : "bg-cream-50 border-transparent hover:bg-cream-100"
                            }
                          `}
                        >
                          <span className="text-2xl block">{avatar.emoji}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 btn-outline"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !newChildName.trim()}
                    className="flex-1 btn-primary"
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
