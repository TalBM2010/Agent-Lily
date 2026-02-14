"use client";

import { useCallback } from "react";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { MicButton } from "@/components/lesson/MicButton";
import { SubtitleDisplay } from "@/components/common/SubtitleDisplay";
import { FriendlyLoader } from "@/components/common/FriendlyLoader";
import { useAudio } from "@/hooks/use-audio";
import { useConversation } from "@/hooks/use-conversation";
import { useAvatar } from "@/hooks/use-avatar";
import { he } from "@/lib/he";
import type { LessonTopic } from "@/lib/types";

type ConversationViewProps = {
  childId: string;
  topic: LessonTopic;
};

export function ConversationView({ childId, topic }: ConversationViewProps) {
  const {
    isRecording,
    error: audioError,
    startRecording,
    stopRecording,
    playAudio,
    isPlaying,
  } = useAudio();

  const { turns, isLoading, error: convError, startLesson, sendTurn, lessonId } =
    useConversation();

  const avatar = useAvatar();

  const handleStart = useCallback(async () => {
    avatar.setThinking();
    const result = await startLesson(childId, topic);
    if (result) {
      avatar.setSpeaking();
      if (result.audioBase64) {
        playAudio(result.audioBase64);
      }
      setTimeout(() => avatar.setIdle(), 4000);
    } else {
      avatar.setIdle();
    }
  }, [childId, topic, startLesson, avatar, playAudio]);

  const handleMicPress = useCallback(async () => {
    avatar.setListening();
    await startRecording();
  }, [startRecording, avatar]);

  const handleMicRelease = useCallback(async () => {
    avatar.setThinking();
    const blob = await stopRecording();
    if (!blob) {
      avatar.setIdle();
      return;
    }

    const responseAudio = await sendTurn(blob);
    if (responseAudio) {
      avatar.setSpeaking();
      playAudio(responseAudio);
      setTimeout(() => avatar.setIdle(), 5000);
    } else {
      avatar.setIdle();
    }
  }, [stopRecording, sendTurn, playAudio, avatar]);

  const lastTurn = turns[turns.length - 1];
  const displayError = audioError || convError;

  // Not started yet
  if (!lessonId) {
    return (
      <div className="flex flex-col items-center gap-8 py-12">
        <AvatarDisplay state={avatar.state} topic={topic} />

        {displayError && (
          <p className="text-red-500 text-sm px-4 text-center max-w-sm">
            {he.lesson.error}
          </p>
        )}

        <button
          onClick={handleStart}
          disabled={isLoading}
          className="px-8 py-4 bg-purple-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-purple-600 active:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-wait"
        >
          {isLoading ? he.lesson.startButtonLoading : he.lesson.startButton}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8 min-h-[70vh] justify-between">
      {/* Avatar */}
      <AvatarDisplay state={avatar.state} topic={topic} />

      {/* Subtitle / last message */}
      <div className="flex-1 flex items-center">
        {isLoading ? (
          <FriendlyLoader />
        ) : (
          lastTurn && (
            <SubtitleDisplay text={lastTurn.text} speaker={lastTurn.speaker} />
          )
        )}
      </div>

      {/* Error display */}
      {displayError && (
        <p className="text-red-500 text-sm px-4 text-center">
          {he.lesson.error}
        </p>
      )}

      {/* Conversation history (scrollable) */}
      {turns.length > 1 && (
        <div className="w-full max-w-md max-h-32 overflow-y-auto px-4">
          {turns.slice(0, -1).map((turn) => (
            <div
              key={turn.id}
              className={`text-sm py-1 ${
                turn.speaker === "AVATAR" ? "text-purple-600" : "text-blue-600"
              }`}
            >
              <span className="font-medium">
                {turn.speaker === "AVATAR" ? he.lesson.lily : he.lesson.you}:
              </span>{" "}
              <span dir="ltr">{turn.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Mic button */}
      <MicButton
        isRecording={isRecording}
        isDisabled={isLoading || isPlaying}
        onPress={handleMicPress}
        onRelease={handleMicRelease}
      />
    </div>
  );
}
