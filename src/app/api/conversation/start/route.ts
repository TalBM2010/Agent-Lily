import { NextResponse } from "next/server";
import { z } from "zod";
import { startConversation } from "@/services/conversation";
import { textToSpeech } from "@/services/speech";
import { toApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { bufferToBase64 } from "@/lib/audio";
import type { LessonTopic } from "@/lib/types";

const startSchema = z.object({
  childId: z.string(),
  topic: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { childId, topic } = startSchema.parse(body);

    const result = await startConversation(childId, topic as LessonTopic);

    // Generate TTS for the greeting
    let greetingAudioBase64: string | null = null;
    try {
      const audioBuffer = await textToSpeech(result.greeting);
      greetingAudioBase64 = bufferToBase64(audioBuffer);
    } catch {
      logger.warn("TTS failed for greeting, returning text-only");
    }

    return NextResponse.json({ ...result, greetingAudioBase64 });
  } catch (error) {
    logger.error({ error }, "POST /api/conversation/start failed");
    const apiError = toApiError(error);
    return NextResponse.json({ error: apiError }, { status: 500 });
  }
}
