import { NextResponse } from "next/server";
import { z } from "zod";
import { textToSpeech } from "@/services/speech";
import { toApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { bufferToBase64 } from "@/lib/audio";

const ttsSchema = z.object({
  text: z.string().min(1).max(500),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = ttsSchema.parse(body);

    const audioBuffer = await textToSpeech(text);
    const audioBase64 = bufferToBase64(audioBuffer);

    return NextResponse.json({ audioBase64 });
  } catch (error) {
    logger.error({ error }, "POST /api/speech/tts failed");
    const apiError = toApiError(error);
    return NextResponse.json({ error: apiError }, { status: 500 });
  }
}
