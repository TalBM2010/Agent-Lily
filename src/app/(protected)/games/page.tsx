"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Gamepad2, Lock, Star, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/navigation";

interface GameCard {
  id: string;
  title: string;
  titleHe: string;
  description: string;
  descriptionHe: string;
  emoji: string;
  gradient: string;
  href: string;
  requiredStars?: number;
  isNew?: boolean;
}

const games: GameCard[] = [
  {
    id: "letters",
    title: "Letter Explorer",
    titleHe: "גלי האותיות",
    description: "Learn the English alphabet",
    descriptionHe: "לומדים את ה-ABC!",
    emoji: "🔤",
    gradient: "from-purple-500 to-pink-500",
    href: "/games/letters",
    isNew: true,
  },
  {
    id: "words",
    title: "Word Match",
    titleHe: "מצאי את המילה",
    description: "Match words with pictures",
    descriptionHe: "חברי מילים לתמונות",
    emoji: "🎯",
    gradient: "from-blue-500 to-cyan-500",
    href: "/games/words",
    requiredStars: 50,
  },
  {
    id: "colors",
    title: "Color Quest",
    titleHe: "מסע הצבעים",
    description: "Learn colors in English",
    descriptionHe: "לומדים צבעים באנגלית",
    emoji: "🎨",
    gradient: "from-pink-500 to-orange-500",
    href: "/games/colors",
    requiredStars: 100,
  },
  {
    id: "numbers",
    title: "Number Ninja",
    titleHe: "נינג'ת המספרים",
    description: "Master numbers 1-20",
    descriptionHe: "שולטים במספרים",
    emoji: "🔢",
    gradient: "from-green-500 to-emerald-500",
    href: "/games/numbers",
    requiredStars: 150,
  },
];

export default function GamesPage() {
  const router = useRouter();
  const [userStars, setUserStars] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const childId = localStorage.getItem("selectedChildId");
    if (!childId) {
      router.push("/children");
      return;
    }

    fetchChildStars(childId);
  }, [router]);

  async function fetchChildStars(childId: string) {
    try {
      const res = await fetch(`/api/child/${childId}`);
      if (res.ok) {
        const data = await res.json();
        setUserStars(data.child.stars);
      }
    } catch (error) {
      console.error("Failed to fetch child data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleGameClick(game: GameCard) {
    if (game.requiredStars && userStars < game.requiredStars) {
      return; // Locked
    }
    router.push(game.href);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <motion.span
          className="text-6xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          🎮
        </motion.span>
      </div>
    );
  }

  return (
    <PageContainer title="משחקים">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.span
            className="text-5xl block mb-2"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎮
          </motion.span>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">משחקים</h1>
          <p className="text-purple-600/80">לומדים תוך כדי כיף!</p>
        </motion.div>

        {/* Stars Display */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Star className="w-6 h-6 text-yellow-500" />
          <span className="text-2xl font-bold text-gray-800">{userStars}</span>
          <span className="text-gray-500">כוכבים</span>
        </motion.div>

        {/* Games Grid */}
        <div className="space-y-3">
          {games.map((game, index) => {
            const isLocked = Boolean(game.requiredStars && userStars < game.requiredStars);

            return (
              <motion.button
                key={game.id}
                onClick={() => handleGameClick(game)}
                className={`
                  relative w-full bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50
                  flex items-center gap-4 text-right overflow-hidden
                  ${isLocked ? "opacity-60" : "hover:shadow-xl transition-shadow"}
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={!isLocked ? { scale: 1.02 } : {}}
                whileTap={!isLocked ? { scale: 0.98 } : {}}
                disabled={isLocked}
              >
                {/* Game icon */}
                <div className={`
                  w-16 h-16 rounded-2xl bg-gradient-to-br ${game.gradient}
                  flex items-center justify-center text-3xl shadow-md
                  ${isLocked ? "grayscale" : ""}
                `}>
                  {isLocked ? <Lock className="w-6 h-6 text-white" /> : game.emoji}
                </div>

                {/* Game info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 text-lg">{game.titleHe}</h3>
                    {game.isNew && (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        חדש!
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{game.descriptionHe}</p>
                  
                  {isLocked && game.requiredStars && (
                    <div className="flex items-center gap-1 mt-1 text-amber-600">
                      <Lock className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        נדרש {game.requiredStars} ⭐ לפתיחה
                      </span>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                {!isLocked && (
                  <span className="text-gray-400 text-xl">←</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Coming soon hint */}
        <motion.p
          className="text-center text-gray-500 text-sm mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          עוד משחקים בדרך! 🚀
        </motion.p>
      </div>
    </PageContainer>
  );
}
