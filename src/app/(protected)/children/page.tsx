"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { CHILD_AVATARS } from "@/lib/constants";

type Child = {
  id: string;
  name: string;
  avatar: string;
  stars: number;
  currentStreak: number;
};

const avatarGradients: Record<string, string> = {
  "🦄": "from-pink-300 to-purple-400",
  "🐱": "from-amber-200 to-orange-400",
  "🐼": "from-gray-200 to-gray-400",
  "⭐": "from-yellow-200 to-amber-400",
  "🦋": "from-cyan-300 to-blue-400",
  "🐰": "from-pink-200 to-rose-400",
  "🌈": "from-pink-300 to-violet-400",
  "🐶": "from-amber-200 to-yellow-400",
};

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
        setChildren([...children, data.child]);
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
    // Save selected child to localStorage and go to topics
    localStorage.setItem("selectedChildId", childId);
    const child = children.find(c => c.id === childId);
    if (child) {
      localStorage.setItem("english-learner-onboarding", JSON.stringify({
        childName: child.name,
        avatar: child.avatar,
      }));
    }
    router.push("/topics");
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <motion.span
          className="text-6xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          🧚
        </motion.span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 px-4 py-8">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-pink-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">מי לומד היום?</h1>
            <p className="text-purple-600/80">בחרו פרופיל להמשיך</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-all"
            title="התנתקות"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Children Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {children.map((child) => (
            <motion.button
              key={child.id}
              onClick={() => handleSelectChild(child.id)}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/50 text-center hover:shadow-xl transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${avatarGradients[child.avatar] || "from-purple-300 to-pink-400"} flex items-center justify-center shadow-md`}>
                <span className="text-3xl">{child.avatar}</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{child.name}</h3>
              <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                <span>⭐ {child.stars}</span>
                <span>🔥 {child.currentStreak}</span>
              </div>
            </motion.button>
          ))}

          {/* Add Child Button */}
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 border-2 border-dashed border-purple-300 text-center hover:bg-white/70 transition-all flex flex-col items-center justify-center"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="w-16 h-16 mb-3 rounded-full bg-purple-100 flex items-center justify-center">
              <Plus className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="font-medium text-purple-600">הוספת ילד/ה</h3>
          </motion.button>
        </div>
      </div>

      {/* Add Child Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              הוספת ילד/ה חדש/ה
            </h2>
            
            <form onSubmit={handleCreateChild} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                  שם
                </label>
                <input
                  type="text"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-100 focus:border-purple-400 focus:outline-none text-right"
                  placeholder="שם הילד/ה"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  בחירת דמות
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CHILD_AVATARS.map((avatar) => (
                    <button
                      key={avatar.emoji}
                      type="button"
                      onClick={() => setNewChildAvatar(avatar.emoji)}
                      className={`p-2 rounded-xl transition-all ${
                        newChildAvatar === avatar.emoji
                          ? `bg-gradient-to-br ${avatarGradients[avatar.emoji] || "from-purple-200 to-pink-200"} shadow-md`
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-2xl">{avatar.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newChildName.trim()}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-50 transition-all"
                >
                  {isCreating ? "יוצר..." : "הוספה"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
