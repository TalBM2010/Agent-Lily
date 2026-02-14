import { NextResponse } from "next/server";
import { z } from "zod";
import { processChildTurn } from "@/services/conversation";
import { speechToText } from "@/services/speech";
import { textToSpeech } from "@/services/speech";
import { toApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { bufferToBase64 } from "@/lib/audio";

const turnSchema = z.object({
  lessonId: z.string(),
  transcript: z.string().optional(),
  audioBase64: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lessonId, transcript: rawTranscript, audioBase64 } =
      turnSchema.parse(body);

    let transcript = rawTranscript ?? "";

    // If audio was sent, transcribe it
    if (audioBase64 && !transcript) {
      const audioBuffer = Buffer.from(audioBase64, "base64");
      transcript = await speechToText(audioBuffer);
    }

    if (!transcript.trim()) {
      return NextResponse.json(
        { error: { code: "EMPTY_INPUT", message: "No speech detected" } },
        { status: 400 }
      );
    }

    const { response, isConcerning } = await processChildTurn(
      lessonId,
      transcript
    );

    // TTS is the only thing we need to await — DB writes already fire-and-forget in processChildTurn
    let responseAudioBase64: string | null = null;
    try {
      const audioBuffer = await textToSpeech(response);
      responseAudioBase64 = bufferToBase64(audioBuffer);
    } catch {
      logger.warn("TTS failed, returning text-only response");
    }

    return NextResponse.json({
      transcript,
      response,
      responseAudioBase64,
      isConcerning,
    });
  } catch (error) {
    logger.error({ error }, "POST /api/conversation/turn failed");
    const apiError = toApiError(error);
    return NextResponse.json({ error: apiError }, { status: 500 });
  }
}
