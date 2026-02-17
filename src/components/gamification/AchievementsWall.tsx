"use client";

import { useState } from "react";

interface Achievement {
  key: string;
  name: string;
  nameHe: string;
  emoji: string;
  description: string;
  descriptionHe: string;
  category: string;
  earned: boolean;
  earnedAt: string | null;
}

interface AchievementsWallProps {
  achievements: Achievement[];
  totalEarned: number;
  totalAvailable: number;
  onClose?: () => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  speaking: "🗣️ דיבור",
  vocabulary: "📚 אוצר מילים",
  streak: "🔥 התמדה",
  accuracy: "🎯 דיוק",
  special: "✨ מיוחדים",
};

const CATEGORY_ORDER = ["speaking", "vocabulary", "streak", "accuracy", "special"];

export function AchievementsWall({ 
  achievements, 
  totalEarned, 
  totalAvailable,
  onClose 
}: AchievementsWallProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredAchievements = selectedCategory
    ? achievements.filter((a) => a.category === selectedCategory)
    : achievements;

  const groupedByCategory = CATEGORY_ORDER.reduce((acc, category) => {
    acc[category] = achievements.filter((a) => a.category === category);
    return acc;
  }, {} as Record<string, Achievement[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-800">🏆 ההישגים שלי</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-gray-500">
            {totalEarned} מתוך {totalAvailable} הישגים
          </p>
          
          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
              style={{ width: `${(totalEarned / totalAvailable) * 100}%` }}
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="p-4 border-b border-gray-100 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
              transition-colors duration-200
              ${selectedCategory === null
                ? "bg-purple-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
            `}
          >
            הכל
          </button>
          {CATEGORY_ORDER.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap
                transition-colors duration-200
                ${selectedCategory === category
                  ? "bg-purple-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
              `}
            >
              {CATEGORY_NAMES[category]}
            </button>
          ))}
        </div>

        {/* Achievements grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedCategory ? (
            <div className="grid grid-cols-3 gap-3">
              {filteredAchievements.map((achievement) => (
                <AchievementCard key={achievement.key} achievement={achievement} />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {CATEGORY_ORDER.map((category) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    {CATEGORY_NAMES[category]}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {groupedByCategory[category].map((achievement) => (
                      <AchievementCard key={achievement.key} achievement={achievement} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`
        relative aspect-square rounded-2xl p-3 
        flex flex-col items-center justify-center
        transition-all duration-200 cursor-pointer
        ${achievement.earned
          ? "bg-gradient-to-br from-yellow-100 to-amber-100 shadow-md hover:shadow-lg hover:scale-105"
          : "bg-gray-100 opacity-50"}
      `}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      {/* Emoji */}
      <span className={`text-3xl ${achievement.earned ? "" : "grayscale"}`}>
        {achievement.earned ? achievement.emoji : "❓"}
      </span>

      {/* Name */}
      <span className={`
        text-xs font-medium text-center mt-1 line-clamp-2
        ${achievement.earned ? "text-gray-700" : "text-gray-400"}
      `}>
        {achievement.earned ? achievement.nameHe : "???"}
      </span>

      {/* Tooltip */}
      {showTooltip && achievement.earned && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                        bg-gray-800 text-white text-xs rounded-lg px-3 py-2
                        whitespace-nowrap z-10 shadow-lg">
          {achievement.descriptionHe}
          <div className="absolute top-full left-1/2 -translate-x-1/2 
                          border-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  );
}
