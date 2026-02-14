import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createClient } from "@deepgram/sdk";
import { SpeechError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { ELEVENLABS_VOICE_ID } from "@/lib/constants";

function getElevenLabsClient(): ElevenLabsClient {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new SpeechError("ElevenLabs API key not configured");
  }
  return new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
}

function getDeepgramClient() {
  if (!process.env.DEEPGRAM_API_KEY) {
    throw new SpeechError("Deepgram API key not configured");
  }
  return createClient(process.env.DEEPGRAM_API_KEY);
}

export async function textToSpeech(text: string): Promise<Buffer> {
  try {
    const client = getElevenLabsClient();
    const audioStream = await client.textToSpeech.convert(ELEVENLABS_VOICE_ID, {
      text,
      modelId: "eleven_turbo_v2_5",
      outputFormat: "mp3_44100_128",
      voiceSettings: {
        stability: 0.75,
        similarityBoost: 0.8,
        style: 0.15,
        speed: 0.8,
      },
    });

    // Read the stream using the reader API
    const reader = audioStream.getReader();
    const chunks: Uint8Array[] = [];
    let done = false;
    while (!done) {
      const result = await reader.read();
      done = result.done;
      if (result.value) {
        chunks.push(result.value);
      }
    }

    return Buffer.concat(chunks);
  } catch (error) {
    logger.error({ error, text }, "TTS failed");
    throw new SpeechError("Failed to generate speech");
  }
}

export async function speechToText(audioBuffer: Buffer): Promise<string> {
  try {
    const client = getDeepgramClient();
    const { result } = await client.listen.prerecorded.transcribeFile(audioBuffer, {
      model: "nova-3",
      language: "en",
      smart_format: true,
    });

    const transcript =
      result?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

    if (!transcript) {
      logger.warn("STT returned empty transcript");
      return "";
    }

    return transcript;
  } catch (error) {
    logger.error({ error }, "STT failed");
    throw new SpeechError("Failed to transcribe speech");
  }
}
