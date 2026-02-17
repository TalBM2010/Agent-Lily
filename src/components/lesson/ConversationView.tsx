"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Square, X } from "lucide-react";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { FriendlyLoader } from "@/components/common/FriendlyLoader";
import {
  GamificationHeader,
  LevelUpModal,
  AchievementPopup,
} from "@/components/gamification";
import { useAudio } from "@/hooks/use-audio";
import { useConversation } from "@/hooks/use-conversation";
import { useGamification } from "@/hooks/use-gamification";
import { useAvatar } from "@/hooks/use-avatar";
import { he } from "@/lib/he";
import type { LessonTopic } from "@/lib/types";

type ConversationViewProps = {
  childId: string;
  topic: LessonTopic;
};

const topicEmojis: Record<LessonTopic, string> = {
  animals: "🦁",
  colors: "🌈",
  family: "🏠",
  food: "🧁",
  numbers: "🔢",
  body: "🤸",
  clothes: "👗",
  weather: "☀️",
  school: "📚",
  toys: "🧸",
};

const messageVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

export function ConversationView({ childId, topic }: ConversationViewProps) {
  const {
    isRecording,
    error: audioError,
    startRecording,
    stopRecording,
    playAudio,
    isPlaying,
    unlockAudio,
  } = useAudio();

  const { 
    turns, 
    isLoading, 
    error: convError, 
    startLesson, 
    sendTurn, 
    lessonId,
    isLessonComplete,
    endLesson,
  } = useConversation();

  const {
    stars,
    level,
    levelProgress,
    starsToNextLevel,
    streak,
    showLevelUp,
    newLevel,
    previousLevel,
    closeLevelUp,
    showAchievement,
    newAchievement,
    closeAchievement,
    recordLessonComplete,
    isLoading: gamificationLoading,
  } = useGamification(childId);

  const avatar = useAvatar();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wasSpeakingRef = useRef(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [starsAnimating, setStarsAnimating] = useState(false);
  const [lessonRecorded, setLessonRecorded] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  // Sync avatar state with actual audio playback
  useEffect(() => {
    if (isPlaying) {
      wasSpeakingRef.current = true;
    } else if (wasSpeakingRef.current) {
      wasSpeakingRef.current = false;
      avatar.setIdle();
    }
  }, [isPlaying, avatar]);

  // Handle lesson completion - only once!
  useEffect(() => {
    if (isLessonComplete && !lessonRecorded) {
      setLessonRecorded(true);
      const wordsLearned = Math.floor(turns.filter(t => t.speaker === "CHILD").length / 2);
      setStarsAnimating(true);
      recordLessonComplete({
        wordsLearned,
        correctAnswers: turns.filter(t => t.speaker === "CHILD").length,
        totalAnswers: turns.filter(t => t.speaker === "CHILD").length,
        isPerfect: true, // For MVP, all lessons are "perfect"
      });
    }
  }, [isLessonComplete, lessonRecorded, turns, recordLessonComplete]);

  const handleStart = useCallback(async () => {
    unlockAudio();
    avatar.setThinking();
    const result = await startLesson(childId, topic);
    if (result) {
      avatar.setSpeaking();
      if (result.audioBase64) {
        playAudio(result.audioBase64);
      } else {
        avatar.setIdle();
      }
    } else {
      avatar.setIdle();
    }
  }, [childId, topic, startLesson, avatar, playAudio, unlockAudio]);

  const handleMicPress = useCallback(async () => {
    unlockAudio();
    avatar.setListening();
    await startRecording();
  }, [startRecording, avatar, unlockAudio]);

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
    } else {
      avatar.setIdle();
    }
  }, [stopRecording, sendTurn, playAudio, avatar]);

  const handleEndLesson = useCallback(() => {
    setShowEndConfirm(false);
    endLesson();
  }, [endLesson]);

  const displayError = audioError || convError;
  const isMicDisabled = isLoading || isPlaying;
  const topicLabel = he.lesson.topicLabels[topic] || topic;

  // Shared avatar panel
  const avatarPanel = (
    <div className="relative overflow-hidden flex items-center justify-center h-[35vh] md:h-full bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800">
      {/* Radial overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.08)_0%,_transparent_70%)]" />
      <AvatarDisplay state={avatar.state} topic={topic} />
      {/* LIVE indicator */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs font-medium text-white/80">{he.avatar.name}</span>
      </div>
    </div>
  );

  // Pre-start state
  if (!lessonId) {
    return (
      <div className="h-screen grid grid-cols-1 md:grid-cols-5">
        <div className="md:col-span-2 flex flex-col items-center justify-center h-[65vh] md:h-auto bg-white/80 backdrop-blur-xl md:rounded-r-3xl md:border-r md:border-white/50 md:shadow-2xl relative md:order-1 order-2">
          {/* Gamification header */}
          {!gamificationLoading && level && (
            <div className="absolute top-4 left-4 right-4">
              <GamificationHeader
                stars={stars}
                streak={streak}
                level={level}
                levelProgress={levelProgress}
                starsToNextLevel={starsToNextLevel}
                compact
              />
            </div>
          )}

          {displayError && (
            <p className="text-red-500 text-sm px-4 text-center max-w-sm mb-4">
              {he.lesson.error}
            </p>
          )}

          {/* Waving emoji */}
          <motion.span
            className="text-6xl mb-6 block"
            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
          >
            👋
          </motion.span>

          {/* Start button */}
          <motion.button
            onClick={handleStart}
            disabled={isLoading}
            className="relative px-10 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xl font-bold rounded-full shadow-xl shadow-purple-500/25 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:cursor-wait"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Shimmer overlay */}
            {!isLoading && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
            )}
            <span className="relative z-10">
              {isLoading ? he.lesson.startButtonLoading : he.lesson.startButton}
            </span>
          </motion.button>
        </div>
        <div className="md:col-span-3 md:order-2 order-1">{avatarPanel}</div>
      </div>
    );
  }

  // Lesson complete state
  if (isLessonComplete) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-8">
        {/* Level up modal */}
        {showLevelUp && newLevel && (
          <LevelUpModal
            level={newLevel}
            previousLevel={previousLevel || undefined}
            onClose={closeLevelUp}
          />
        )}

        {/* Achievement popup */}
        {showAchievement && newAchievement && (
          <AchievementPopup
            achievement={newAchievement}
            onClose={closeAchievement}
          />
        )}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 shadow-2xl max-w-md text-center"
        >
          <motion.span
            className="text-7xl block mb-4"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5 }}
          >
            🎉
          </motion.span>

          <h2 className="text-3xl font-bold text-purple-600 mb-2">
            כל הכבוד!
          </h2>
          <p className="text-gray-600 mb-6">
            סיימת שיעור ב{topicLabel}!
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">
                ⭐ {stars}
              </div>
              <div className="text-sm text-gray-500">כוכבים</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">
                🔥 {streak}
              </div>
              <div className="text-sm text-gray-500">ימים ברצף</div>
            </div>
            {level && (
              <div className="text-center">
                <div className="text-3xl">{level.emoji}</div>
                <div className="text-sm text-gray-500">{level.nameHe}</div>
              </div>
            )}
          </div>

          {/* Back button */}
          <motion.a
            href="/topics"
            className="inline-block w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 
                       text-white text-xl font-bold rounded-full
                       shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            לשיעור הבא! 🚀
          </motion.a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-5">
      {/* Level up modal */}
      {showLevelUp && newLevel && (
        <LevelUpModal
          level={newLevel}
          previousLevel={previousLevel || undefined}
          onClose={closeLevelUp}
        />
      )}

      {/* Achievement popup */}
      {showAchievement && newAchievement && (
        <AchievementPopup
          achievement={newAchievement}
          onClose={closeAchievement}
        />
      )}

      {/* End lesson confirmation */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                לסיים את השיעור?
              </h3>
              <p className="text-gray-600 mb-4">
                אם תסיימי עכשיו תקבלי את הכוכבים שצברת! ⭐
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl"
                >
                  להמשיך
                </button>
                <button
                  onClick={handleEndLesson}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl"
                >
                  לסיים 🎉
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left panel — chat */}
      <div className="md:col-span-2 flex flex-col h-[65vh] md:h-screen bg-white/80 backdrop-blur-xl rounded-3xl md:rounded-none md:rounded-r-3xl border border-white/50 md:border-r md:border-y-0 md:border-l-0 shadow-2xl shadow-purple-500/10 md:order-1 order-2">
        {/* Gamification header */}
        {!gamificationLoading && level && (
          <div className="px-4 pt-3">
            <GamificationHeader
              stars={stars}
              streak={streak}
              level={level}
              levelProgress={levelProgress}
              starsToNextLevel={starsToNextLevel}
              animateStars={starsAnimating}
              compact
            />
          </div>
        )}

        {/* Chat header — frosted strip */}
        <div className="px-5 py-3.5 border-b border-gray-100/80 bg-white/60 backdrop-blur-md rounded-t-3xl md:rounded-tr-3xl md:rounded-tl-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                <h2 className="text-lg font-bold text-purple-700">{he.avatar.name}</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-600 text-xs font-medium">
                {topicEmojis[topic]} {topicLabel}
              </span>
            </div>

            {/* End lesson button */}
            <button
              onClick={() => setShowEndConfirm(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              title="סיים שיעור"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {isLoading && turns.length === 0 && <FriendlyLoader />}

          <AnimatePresence mode="popLayout">
            {turns.map((turn) => (
              <motion.div
                key={turn.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                className={`flex ${turn.speaker === "CHILD" ? "justify-end" : "justify-start"}`}
              >
                {turn.speaker === "AVATAR" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2 mt-1 text-sm">
                    {topicEmojis[topic]}
                  </div>
                )}
                <div
                  dir={turn.speaker === "AVATAR" ? "ltr" : undefined}
                  className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
                    turn.speaker === "AVATAR"
                      ? "bg-purple-50 border border-purple-100 text-purple-900 rounded-2xl rounded-tl-md"
                      : "bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-2xl rounded-tr-md shadow-md shadow-blue-500/20"
                  }`}
                >
                  {turn.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isLoading && turns.length > 0 && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2 mt-1 text-sm">
                  {topicEmojis[topic]}
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-purple-400"
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {displayError && (
          <p className="text-red-500 text-xs px-5 text-center">
            {he.lesson.error}
          </p>
        )}

        {/* Footer — mic area */}
        <div className="flex flex-col items-center gap-2 py-4 border-t border-gray-100/80 bg-white/60 backdrop-blur-md rounded-b-3xl md:rounded-br-3xl md:rounded-bl-none">
          <div className="relative">
            {/* Recording pulse ring */}
            {isRecording && (
              <motion.div
                className="absolute -inset-3 rounded-full bg-red-400/30"
                animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}

            <motion.button
              className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg ${
                isRecording
                  ? "bg-red-500"
                  : isMicDisabled
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-br from-purple-500 to-indigo-500 shadow-purple-500/25"
              }`}
              whileHover={!isMicDisabled && !isRecording ? { scale: 1.1 } : {}}
              whileTap={!isMicDisabled ? { scale: 0.95 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={isRecording ? handleMicRelease : handleMicPress}
              disabled={isMicDisabled && !isRecording}
              aria-label={isRecording ? he.mic.stopRecording : he.mic.startRecording}
            >
              {isRecording ? (
                <Square className="w-6 h-6" />
              ) : isMicDisabled ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </motion.button>
          </div>

          <span className="text-xs text-gray-400 font-medium">
            {he.lesson.holdToTalk}
          </span>
        </div>
      </div>

      {/* Right panel — avatar "video feed" */}
      <div className="md:col-span-3 md:order-2 order-1">{avatarPanel}</div>
    </div>
  );
}
