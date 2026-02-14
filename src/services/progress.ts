import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { ChildProgress } from "@/lib/types";

export async function trackVocabulary(
  childId: string,
  words: string[]
): Promise<void> {
  const uniqueWords = [...new Set(words.filter((w) => w.length > 1))];

  for (const word of uniqueWords) {
    await prisma.vocabulary.upsert({
      where: { childId_word: { childId, word } },
      create: { childId, word },
      update: {
        timesSeen: { increment: 1 },
        lastSeen: new Date(),
      },
    });
  }

  logger.info({ childId, wordCount: uniqueWords.length }, "Vocabulary tracked");
}

export async function getChildProgress(
  childId: string
): Promise<ChildProgress> {
  const [lessons, vocabStats] = await Promise.all([
    prisma.lesson.findMany({
      where: { childId },
      orderBy: { startedAt: "desc" },
      take: 10,
      include: { _count: { select: { turns: true } } },
    }),
    prisma.vocabulary.aggregate({
      where: { childId },
      _count: { _all: true },
    }),
  ]);

  const masteredCount = await prisma.vocabulary.count({
    where: { childId, isMastered: true },
  });

  return {
    totalLessons: await prisma.lesson.count({ where: { childId } }),
    totalWords: vocabStats._count._all,
    masteredWords: masteredCount,
    recentLessons: lessons.map((lesson) => ({
      id: lesson.id,
      topic: lesson.topic,
      difficulty: lesson.difficulty,
      score: lesson.score,
      startedAt: lesson.startedAt,
      completedAt: lesson.completedAt,
      turnCount: lesson._count.turns,
    })),
  };
}
