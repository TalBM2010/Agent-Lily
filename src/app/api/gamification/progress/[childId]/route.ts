import { NextRequest, NextResponse } from "next/server";
import { getChildProgress } from "@/services/gamification";
import { ACHIEVEMENTS } from "@/lib/gamification/constants";

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

    const progress = await getChildProgress(childId);

    // Include achievement definitions for earned achievements
    const achievementsWithDetails = progress.achievements.map((key) => ({
      key,
      ...ACHIEVEMENTS[key],
    }));

    return NextResponse.json({
      ...progress,
      achievementsWithDetails,
    });
  } catch (error) {
    console.error("[API] Error getting child progress:", error);
    
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: { code: "CHILD_NOT_FOUND", message: "Child not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to get progress" } },
      { status: 500 }
    );
  }
}
