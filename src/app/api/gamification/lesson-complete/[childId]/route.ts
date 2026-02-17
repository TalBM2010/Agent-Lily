import { NextRequest, NextResponse } from "next/server";
import { recordLessonCompletion } from "@/services/gamification";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const { childId } = await params;
    const body = await request.json();

    if (!childId) {
      return NextResponse.json(
        { error: { code: "MISSING_CHILD_ID", message: "Child ID is required" } },
        { status: 400 }
      );
    }

    const {
      wordsLearned = 0,
      correctAnswers = 0,
      totalAnswers = 0,
      isPerfect = false,
    } = body;

    const result = await recordLessonCompletion(childId, {
      wordsLearned,
      correctAnswers,
      totalAnswers,
      isPerfect,
    });

    return NextResponse.json({
      success: true,
      starsEarned: result.starsEarned,
      streak: {
        current: result.streakResult.currentStreak,
        isNewRecord: result.streakResult.isNewRecord,
        longest: result.streakResult.longestStreak,
        wasBroken: result.streakResult.streakBroken,
      },
      levelUp: result.leveledUp
        ? {
            newLevel: result.newLevel,
          }
        : null,
      newAchievements: result.newAchievements.map((a) => ({
        key: a.key,
        name: a.achievement.name,
        nameHe: a.achievement.nameHe,
        emoji: a.achievement.emoji,
        description: a.achievement.description,
        descriptionHe: a.achievement.descriptionHe,
      })),
    });
  } catch (error) {
    console.error("[API] Error recording lesson completion:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: { code: "CHILD_NOT_FOUND", message: "Child not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to record lesson completion" } },
      { status: 500 }
    );
  }
}
