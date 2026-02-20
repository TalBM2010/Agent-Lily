"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Star, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/navigation";

interface GameCard {
  id: string;
  titleHe: string;
  descriptionHe: string;
  emoji: string;
  bgColor: string;
  href: string;
  requiredStars?: number;
  isNew?: boolean;
}

const games: GameCard[] = [
  {
    id: "letters",
    titleHe: "גלי האותיות",
    descriptionHe: "לומדים את ה-ABC!",
    emoji: "🔤",
    bgColor: "bg-sky-light",
    href: "/games/letters",
    isNew: true,
  },
  {
    id: "words",
    titleHe: "מצאי את המילה",
    descriptionHe: "חברי מילים לתמונות",
    emoji: "🎯",
    bgColor: "bg-green-light",
    href: "/games/words",
    requiredStars: 50,
  },
  {
    id: "colors",
    titleHe: "מסע הצבעים",
    descriptionHe: "לומדים צבעים באנגלית",
    emoji: "🎨",
    bgColor: "bg-lily-light",
    href: "/games/colors",
    requiredStars: 100,
  },
  {
    id: "numbers",
    titleHe: "נינג'ת המספרים",
    descriptionHe: "שולטים במספרים",
    emoji: "🔢",
    bgColor: "bg-gold-light",
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.span
          className="text-6xl"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🎮
        </motion.span>
      </div>
    );
  }

  return (
    <PageContainer title="משחקים">
      <div className="max-w-lg mx-auto px-4 space-y-4">
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
          <p className="text-lily font-medium">לומדים תוך כדי כיף!</p>
        </motion.div>

        {/* Stars Display */}
        <motion.div
          className="bg-white rounded-xl p-4 flex items-center justify-center gap-3 shadow-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Star className="w-6 h-6 text-gold" fill="currentColor" />
          <span className="text-2xl font-bold text-gray-800">{userStars}</span>
          <span className="text-gray-500">כוכבים</span>
        </motion.div>

        {/* Games List */}
        <div className="space-y-3">
          {games.map((game, index) => {
            const isLocked = Boolean(game.requiredStars && userStars < game.requiredStars);

            return (
              <motion.button
                key={game.id}
                onClick={() => handleGameClick(game)}
                className={`
                  relative w-full bg-white rounded-xl p-4 shadow-md
                  flex items-center gap-4 text-right
                  ${isLocked ? "opacity-60" : "hover:shadow-lg transition-shadow"}
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
                  w-14 h-14 rounded-xl ${game.bgColor}
                  flex items-center justify-center text-3xl
                  ${isLocked ? "grayscale" : ""}
                `}>
                  {isLocked ? <Lock className="w-6 h-6 text-gray-400" /> : game.emoji}
                </div>

                {/* Game info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 text-lg">{game.titleHe}</h3>
                    {game.isNew && (
                      <span className="bg-gold text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        חדש!
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{game.descriptionHe}</p>
                  
                  {isLocked && game.requiredStars && (
                    <div className="flex items-center gap-1 mt-1 text-gold">
                      <Lock className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        נדרש {game.requiredStars} ⭐
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

        {/* Coming soon */}
        <motion.p
          className="text-center text-gray-400 text-sm mt-6"
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
