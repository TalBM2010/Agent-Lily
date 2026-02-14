import { prisma } from "@/lib/db";
import { LESSON_TOPICS } from "@/lib/constants";
import type { LessonTopic } from "@/lib/types";

export async function generateLessonTopic(
  childId: string
): Promise<LessonTopic> {
  const recentLessons = await prisma.lesson.findMany({
    where: { childId },
    orderBy: { startedAt: "desc" },
    take: LESSON_TOPICS.length,
    select: { topic: true },
  });

  const recentTopics = new Set(recentLessons.map((l) => l.topic));

  // Pick the first topic that hasn't been done recently
  const nextTopic = LESSON_TOPICS.find((t) => !recentTopics.has(t.id));

  // If all topics have been done recently, cycle back to the first
  return nextTopic?.id ?? LESSON_TOPICS[0].id;
}
