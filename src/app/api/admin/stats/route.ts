export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
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

    // Get current date for comparisons
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all stats in parallel
    const [
      totalUsers,
      totalChildren,
      totalLessons,
      completedLessons,
      activeUsersToday,
      activeUsersWeek,
      recentUsers,
      dailyActivityData,
      topChildren,
    ] = await Promise.all([
      // Total users
      db.user.count(),
      
      // Total children
      db.child.count(),
      
      // Total lessons
      db.lesson.count(),
      
      // Completed lessons
      db.lesson.count({
        where: { completedAt: { not: null } },
      }),
      
      // Active users today (children with activity)
      db.dailyActivity.groupBy({
        by: ["childId"],
        where: { date: today },
        _count: true,
      }).then(r => r.length),
      
      // Active users this week
      db.dailyActivity.groupBy({
        by: ["childId"],
        where: { date: { gte: weekAgo } },
        _count: true,
      }).then(r => r.length),
      
      // Recent users (last 10)
      db.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          _count: { select: { children: true } },
        },
      }),
      
      // Daily activity for chart (last 30 days)
      db.dailyActivity.groupBy({
        by: ["date"],
        where: { date: { gte: monthAgo } },
        _sum: {
          lessonsCompleted: true,
          starsEarned: true,
        },
        _count: true,
        orderBy: { date: "asc" },
      }),
      
      // Top performing children
      db.child.findMany({
        take: 10,
        orderBy: { stars: "desc" },
        select: {
          id: true,
          name: true,
          avatar: true,
          stars: true,
          totalLessons: true,
          currentStreak: true,
          user: {
            select: { email: true },
          },
        },
      }),
    ]);

    // Calculate aggregates
    const totalStars = await db.child.aggregate({
      _sum: { stars: true },
    });

    const totalWordsLearned = await db.child.aggregate({
      _sum: { totalWordsLearned: true },
    });

    // Format daily activity for chart
    const engagementChart = dailyActivityData.map((day) => ({
      date: day.date.toISOString().split("T")[0],
      lessons: day._sum.lessonsCompleted || 0,
      stars: day._sum.starsEarned || 0,
      activeUsers: day._count,
    }));

    return NextResponse.json({
      overview: {
        totalUsers,
        totalChildren,
        totalLessons,
        completedLessons,
        activeUsersToday,
        activeUsersWeek,
        totalStars: totalStars._sum.stars || 0,
        totalWordsLearned: totalWordsLearned._sum.totalWordsLearned || 0,
      },
      recentUsers: recentUsers.map((u) => ({
        ...u,
        childrenCount: u._count.children,
      })),
      topChildren,
      engagementChart,
    });
  } catch (error) {
    console.error("[Admin API] Error fetching stats:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch stats" } },
      { status: 500 }
    );
  }
}
