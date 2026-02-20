"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ConversationView } from "@/components/lesson/ConversationView";
import { FriendlyLoader } from "@/components/common/FriendlyLoader";
import { he } from "@/lib/he";
import type { LessonTopic } from "@/lib/types";

function LessonContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const topic = searchParams.get("topic") as LessonTopic | null;
  const [childId, setChildId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get selected child from localStorage
    const selectedChildId = localStorage.getItem("selectedChildId");
    if (!selectedChildId) {
      // No child selected, redirect to children selection
      router.push("/children");
      return;
    }
    setChildId(selectedChildId);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <FriendlyLoader />;
  }

  if (!childId) {
    return null; // Redirecting
  }

  if (!topic) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-lg text-gray-500">
          {he.lesson.noTopic}
        </p>
      </div>
    );
  }

  return <ConversationView childId={childId} topic={topic} />;
}

export default function LessonPage() {
  return (
    <main>
      <Suspense fallback={<FriendlyLoader />}>
        <LessonContent />
      </Suspense>
    </main>
  );
}
