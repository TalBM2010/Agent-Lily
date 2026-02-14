import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { AIError } from "@/lib/errors";

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined;
};

function createAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AIError("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey });
}

export const anthropic =
  globalForAnthropic.anthropic ?? createAnthropicClient();

if (process.env.NODE_ENV !== "production") {
  globalForAnthropic.anthropic = anthropic;
}

export async function generateResponse(
  systemPrompt: string,
  messages: MessageParam[]
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new AIError("No text response from AI");
  }

  return textBlock.text;
}
