import { logger } from "@/lib/logger";

const BLOCKED_PATTERNS = [
  /\b(kill|die|dead|murder|weapon|gun|knife)\b/i,
  /\b(sex|naked|kiss|dating|boyfriend|girlfriend)\b/i,
  /\b(stupid|dumb|ugly|hate you|shut up|idiot)\b/i,
  /\b(address|phone number|where do you live|what school)\b/i,
  /\b(meet me|come to|let's go to)\b/i,
];

const CONCERNING_PATTERNS = [
  /\b(scared|afraid|hurt|hitting|yelling)\b/i,
  /\b(sad|crying|lonely|no friends|nobody likes me)\b/i,
  /\b(don'?t want to live|want to die)\b/i,
];

export function filterAIResponse(text: string): string {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      logger.warn({ text, pattern: pattern.source }, "AI response blocked by safety filter");
      return "Let's talk about something fun! What's your favorite thing to do?";
    }
  }
  // Strip markdown bold/italic markers — TTS reads them as literal asterisks
  text = text.replace(/\*+/g, "");

  return text;
}

export function detectConcerningInput(text: string): {
  isConcerning: boolean;
  reason?: string;
} {
  for (const pattern of CONCERNING_PATTERNS) {
    if (pattern.test(text)) {
      logger.warn({ text, pattern: pattern.source }, "Concerning child input detected");
      return { isConcerning: true, reason: pattern.source };
    }
  }
  return { isConcerning: false };
}
