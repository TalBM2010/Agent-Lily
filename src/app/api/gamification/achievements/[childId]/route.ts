export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ACHIEVEMENTS, ALL_ACHIEVEMENT_KEYS } from "@/lib/gamification/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const { childId } = await params;

    if (!childId) {
      return NextResponse.json(
        { error: { code: "MISSING_CHILD_ID", message: "Child ID is required" } },
        { status: 400 }
      );
    }

    // Get child's earned achievements
    const earnedAchievements = await db.achievement.findMany({
      where: { childId },
      select: { key: true, earnedAt: true },
    });

    const earnedKeys = new Set(earnedAchievements.map((a: { key: string; earnedAt: Date }) => a.key));
    const earnedMap = new Map(earnedAchievements.map((a: { key: string; earnedAt: Date }) => [a.key, a.earnedAt]));

    // Build full achievement list with earned status
    const allAchievements = ALL_ACHIEVEMENT_KEYS.map((key) => {
      const def = ACHIEVEMENTS[key];
      const isEarned = earnedKeys.has(key);

      return {
        key,
        name: def.name,
        nameHe: def.nameHe,
        description: def.description,
        descriptionHe: def.descriptionHe,
        emoji: def.emoji,
        category: def.category,
        earned: isEarned,
        earnedAt: isEarned ? earnedMap.get(key) : null,
      };
    });

    // Group by category
    const byCategory = {
      speaking: allAchievements.filter((a) => a.category === "speaking"),
      vocabulary: allAchievements.filter((a) => a.category === "vocabulary"),
      streak: allAchievements.filter((a) => a.category === "streak"),
      accuracy: allAchievements.filter((a) => a.category === "accuracy"),
      special: allAchievements.filter((a) => a.category === "special"),
    };

    return NextResponse.json({
      total: ALL_ACHIEVEMENT_KEYS.length,
      earned: earnedAchievements.length,
      achievements: allAchievements,
      byCategory,
    });
  } catch (error) {
    console.error("[API] Error getting achievements:", error);

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to get achievements" } },
      { status: 500 }
    );
  }
}
