export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Check admin access
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "users";

    if (type === "users") {
      const users = await db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          children: {
            select: {
              name: true,
              stars: true,
              totalLessons: true,
            },
          },
        },
      });

      const csv = [
        "ID,Name,Email,Role,Created At,Children Count,Total Stars,Total Lessons",
        ...users.map((u) => {
          const totalStars = u.children.reduce((sum, c) => sum + c.stars, 0);
          const totalLessons = u.children.reduce((sum, c) => sum + c.totalLessons, 0);
          return `${u.id},"${u.name || ""}",${u.email},${u.role},${u.createdAt.toISOString()},${u.children.length},${totalStars},${totalLessons}`;
        }),
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="users-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    if (type === "activity") {
      const activities = await db.dailyActivity.findMany({
        orderBy: { date: "desc" },
        take: 1000,
        include: {
          child: {
            select: {
              name: true,
              user: { select: { email: true } },
            },
          },
        },
      });

      const csv = [
        "Date,Child Name,Parent Email,Lessons Completed,Stars Earned,Words Learned,Minutes Practiced",
        ...activities.map((a) => 
          `${a.date.toISOString().split("T")[0]},"${a.child.name}",${a.child.user.email},${a.lessonsCompleted},${a.starsEarned},${a.wordsLearned},${a.minutesPracticed}`
        ),
      ].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="activity-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(
      { error: { code: "INVALID_TYPE", message: "Invalid export type" } },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Admin API] Error exporting data:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to export data" } },
      { status: 500 }
    );
  }
}
