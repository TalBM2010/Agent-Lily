import { prisma } from "@/lib/db";
import { generateResponse } from "@/lib/ai";
import { buildConversationPrompt } from "@/../prompts/conversation-prompt";
import { buildLessonIntroPrompt } from "@/../prompts/lesson-intro-prompt";
import { filterAIResponse, detectConcerningInput } from "@/services/safety";
import { trackVocabulary } from "@/services/progress";
import { LESSON_TOPICS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { DatabaseError, AIError } from "@/lib/errors";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import type { LessonTopic } from "@/lib/types";

export async function startConversation(
  childId: string,
  topic: LessonTopic
): Promise<{ lessonId: string; greeting: string }> {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: { vocabulary: { where: { isMastered: true }, select: { word: true } } },
  });

  if (!child) {
    throw new DatabaseError(`Child not found: ${childId}`);
  }

  const topicConfig = LESSON_TOPICS.find((t) => t.id === topic);
  if (!topicConfig) {
    throw new DatabaseError(`Unknown topic: ${topic}`);
  }

  const lesson = await prisma.lesson.create({
    data: {
      childId,
      topic,
      difficulty: child.currentLevel,
    },
  });

  const introPrompt = buildLessonIntroPrompt({
    childName: child.name,
    level: child.currentLevel,
    topic: topicConfig.label,
    targetWords: topicConfig.targetWords,
  });

  let greeting: string;
  try {
    greeting = await generateResponse(introPrompt, [
      { role: "user", content: "Start the lesson!" },
    ]);
  } catch (error) {
    logger.error({ error, childId, lessonId: lesson.id }, "Failed to generate greeting");
    throw new AIError("Failed to start conversation");
  }

  greeting = filterAIResponse(greeting);

  await prisma.turn.create({
    data: { lessonId: lesson.id, speaker: "AVATAR", text: greeting },
  });

  logger.info({ childId, lessonId: lesson.id, topic }, "Conversation started");

  return { lessonId: lesson.id, greeting };
}

export async function processChildTurn(
  lessonId: string,
  transcript: string
): Promise<{ response: string; isConcerning: boolean }> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      child: {
        include: { vocabulary: { select: { word: true, isMastered: true } } },
      },
      turns: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!lesson) {
    throw new DatabaseError(`Lesson not found: ${lessonId}`);
  }

  const { isConcerning, reason } = detectConcerningInput(transcript);
  if (isConcerning) {
    logger.warn({ lessonId, reason }, "Concerning input from child");
  }

  const topicConfig = LESSON_TOPICS.find((t) => t.id === lesson.topic);
  const knownWords = lesson.child.vocabulary
    .filter((v) => v.isMastered)
    .map((v) => v.word);

  const systemPrompt = buildConversationPrompt({
    childName: lesson.child.name,
    level: lesson.difficulty,
    topic: topicConfig?.label ?? lesson.topic,
    knownWords,
    targetWords: topicConfig?.targetWords ?? [],
  });

  const messages: MessageParam[] = lesson.turns.map((turn) => ({
    role: turn.speaker === "AVATAR" ? ("assistant" as const) : ("user" as const),
    content: turn.text,
  }));
  messages.push({ role: "user", content: transcript });

  // Fire child turn DB write in parallel with AI call (don't block AI on it)
  const childTurnWrite = prisma.turn
    .create({ data: { lessonId, speaker: "CHILD", text: transcript } })
    .catch((error) => logger.error({ error, lessonId }, "Failed to save child turn"));

  let response: string;
  try {
    response = await generateResponse(systemPrompt, messages);
  } catch (error) {
    logger.error({ error, lessonId }, "Failed to generate AI response");
    throw new AIError("Failed to generate response");
  }

  response = filterAIResponse(response);

  // Fire-and-forget: avatar turn write + vocab tracking run in background
  const words = transcript.toLowerCase().split(/\s+/).filter(Boolean);
  Promise.all([
    prisma.turn.create({ data: { lessonId, speaker: "AVATAR", text: response } }),
    trackVocabulary(lesson.childId, words),
    childTurnWrite,
  ]).catch((error) => logger.error({ error, lessonId }, "Background DB writes failed"));

  return { response, isConcerning };
}

export async function endConversation(
  lessonId: string
): Promise<{ score: number }> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { turns: true },
  });

  if (!lesson) {
    throw new DatabaseError(`Lesson not found: ${lessonId}`);
  }

  const childTurns = lesson.turns.filter((t) => t.speaker === "CHILD");
  const score = Math.min(100, childTurns.length * 10);

  await prisma.lesson.update({
    where: { id: lessonId },
    data: { completedAt: new Date(), score },
  });

  logger.info({ lessonId, score, totalTurns: lesson.turns.length }, "Conversation ended");

  return { score };
}
