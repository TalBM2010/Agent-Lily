export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const { userId } = await params;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        children: {
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
            createdAt: true,
            lessons: {
              take: 10,
              orderBy: { startedAt: "desc" },
              select: {
                id: true,
                topic: true,
                completedAt: true,
                startedAt: true,
              },
            },
            achievements: {
              select: {
                id: true,
                key: true,
                name: true,
                earnedAt: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[Admin API] Error fetching user:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch user" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const { userId } = await params;
    const body = await request.json();

    const allowedFields = ["name", "role"];
    const updateData: Record<string, unknown> = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[Admin API] Error updating user:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update user" } },
      { status: 500 }
    );
  }
}
