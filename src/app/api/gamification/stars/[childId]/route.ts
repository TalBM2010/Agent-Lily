import { NextRequest, NextResponse } from "next/server";
import { addStars, recordAnswer } from "@/services/gamification";

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

    // Check if this is an answer recording or direct star addition
    if (body.type === "answer") {
      const { isCorrect, attemptNumber } = body;

      if (typeof isCorrect !== "boolean") {
        return NextResponse.json(
          { error: { code: "INVALID_INPUT", message: "isCorrect is required" } },
          { status: 400 }
        );
      }

      const attempt = Math.min(3, Math.max(1, attemptNumber || 1)) as 1 | 2 | 3;
      const result = await recordAnswer(childId, isCorrect, attempt);

      return NextResponse.json(result);
    } else {
      // Direct star addition
      const { amount, reason } = body;

      if (typeof amount !== "number" || amount <= 0) {
        return NextResponse.json(
          { error: { code: "INVALID_AMOUNT", message: "Amount must be a positive number" } },
          { status: 400 }
        );
      }

      const result = await addStars(childId, amount, reason || "manual");

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("[API] Error adding stars:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: { code: "CHILD_NOT_FOUND", message: "Child not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to add stars" } },
      { status: 500 }
    );
  }
}
