import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const { childId } = await params;
    const body = await request.json();
    const { name } = body as { name?: string };

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Name is required" } },
        { status: 400 }
      );
    }

    const child = await prisma.child.update({
      where: { id: childId },
      data: { name: name.trim() },
    });

    return NextResponse.json({ id: child.id, name: child.name });
  } catch (error) {
    logger.error({ error }, "PATCH /api/child/[childId] failed");
    const apiError = toApiError(error);
    return NextResponse.json({ error: apiError }, { status: 500 });
  }
}
