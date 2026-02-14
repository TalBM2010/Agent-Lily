"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ConversationView } from "@/components/lesson/ConversationView";
import { FriendlyLoader } from "@/components/common/FriendlyLoader";
import { he } from "@/lib/he";
import type { LessonTopic } from "@/lib/types";

// Hardcoded child ID for MVP — will come from auth later
const DEFAULT_CHILD_ID = "test-child-1";

function LessonContent() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") as LessonTopic | null;

  if (!topic) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-lg text-gray-500">
          {he.lesson.noTopic}
        </p>
      </div>
    );
  }

  return <ConversationView childId={DEFAULT_CHILD_ID} topic={topic} />;
}

export default function LessonPage() {
  return (
    <main className="max-w-lg mx-auto px-4">
      <Suspense fallback={<FriendlyLoader />}>
        <LessonContent />
      </Suspense>
    </main>
  );
}
