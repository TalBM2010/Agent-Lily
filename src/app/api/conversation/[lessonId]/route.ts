import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        turns: { orderBy: { createdAt: "asc" } },
        child: { select: { name: true } },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Lesson not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(lesson);
  } catch (error) {
    logger.error({ error }, "GET /api/conversation/[lessonId] failed");
    const { statusCode, ...apiError } = toApiError(error);
    return NextResponse.json({ error: apiError }, { status: statusCode });
  }
}
