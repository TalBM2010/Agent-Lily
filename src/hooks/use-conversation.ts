"use client";

import { useState, useCallback } from "react";
import { blobToBase64 } from "@/lib/audio";
import type { ConversationTurn, LessonTopic } from "@/lib/types";

type UseConversationReturn = {
  lessonId: string | null;
  turns: ConversationTurn[];
  isLoading: boolean;
  error: string | null;
  startLesson: (childId: string, topic: LessonTopic) => Promise<{ greeting: string; audioBase64: string | null } | null>;
  sendTurn: (audioBlob: Blob) => Promise<string | null>;
  sendTextTurn: (text: string) => Promise<string | null>;
};

export function useConversation(): UseConversationReturn {
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startLesson = useCallback(
    async (
      childId: string,
      topic: LessonTopic
    ): Promise<{ greeting: string; audioBase64: string | null } | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/conversation/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childId, topic }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message ?? "Failed to start");

        setLessonId(data.lessonId);
        setTurns([
          {
            id: crypto.randomUUID(),
            speaker: "AVATAR",
            text: data.greeting,
            createdAt: new Date(),
          },
        ]);

        return {
          greeting: data.greeting,
          audioBase64: data.greetingAudioBase64 ?? null,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const processTurnResponse = useCallback(
    (data: {
      transcript: string;
      response: string;
      responseAudioBase64: string | null;
    }) => {
      setTurns((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          speaker: "CHILD",
          text: data.transcript,
          createdAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          speaker: "AVATAR",
          text: data.response,
          createdAt: new Date(),
        },
      ]);
      return data.responseAudioBase64;
    },
    []
  );

  const sendTurn = useCallback(
    async (audioBlob: Blob): Promise<string | null> => {
      if (!lessonId) return null;
      setIsLoading(true);
      setError(null);

      try {
        const audioBase64 = await blobToBase64(audioBlob);
        const res = await fetch("/api/conversation/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId, audioBase64 }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message ?? "Failed");

        return processTurnResponse(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [lessonId, processTurnResponse]
  );

  const sendTextTurn = useCallback(
    async (text: string): Promise<string | null> => {
      if (!lessonId) return null;
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/conversation/turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId, transcript: text }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message ?? "Failed");

        return processTurnResponse(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [lessonId, processTurnResponse]
  );

  return {
    lessonId,
    turns,
    isLoading,
    error,
    startLesson,
    sendTurn,
    sendTextTurn,
  };
}
