export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { getChildProgress } from "@/services/progress";
import { toApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const { childId } = await params;
    const progress = await getChildProgress(childId);
    return NextResponse.json(progress);
  } catch (error) {
    logger.error({ error }, "GET /api/child/[childId]/progress failed");
    const apiError = toApiError(error);
    return NextResponse.json({ error: apiError }, { status: 500 });
  }
}
