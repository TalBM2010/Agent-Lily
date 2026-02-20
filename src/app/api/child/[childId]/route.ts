export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET - Fetch child data
export async function GET(
  request: Request,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { childId } = await params;

    const child = await db.child.findFirst({
      where: { 
        id: childId,
        userId: session.user.id, // Security: only owner can access
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        stars: true,
        currentStreak: true,
        longestStreak: true,
        totalLessons: true,
        totalWordsLearned: true,
        gamificationLevel: true,
        lastActivityDate: true,
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    return NextResponse.json({ child });
  } catch (error) {
    console.error("GET /api/child/[childId] failed:", error);
    return NextResponse.json({ error: "Failed to fetch child" }, { status: 500 });
  }
}

// PATCH - Update child data
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { childId } = await params;
    const body = await request.json();
    const { name } = body as { name?: string };

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Security: only owner can update
    const child = await db.child.updateMany({
      where: { 
        id: childId,
        userId: session.user.id,
      },
      data: { name: name.trim() },
    });

    if (child.count === 0) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/child/[childId] failed:", error);
    return NextResponse.json({ error: "Failed to update child" }, { status: 500 });
  }
}
