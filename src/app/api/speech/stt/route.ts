import { NextResponse } from "next/server";
import { z } from "zod";
import { speechToText } from "@/services/speech";
import { toApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const sttSchema = z.object({
  audioBase64: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { audioBase64 } = sttSchema.parse(body);

    const audioBuffer = Buffer.from(audioBase64, "base64");
    const transcript = await speechToText(audioBuffer);

    return NextResponse.json({ transcript });
  } catch (error) {
    logger.error({ error }, "POST /api/speech/stt failed");
    const { statusCode, ...apiError } = toApiError(error);
    return NextResponse.json({ error: apiError }, { status: statusCode });
  }
}
