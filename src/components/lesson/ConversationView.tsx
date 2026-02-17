"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Square, X, Sparkles, Volume2 } from "lucide-react";
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
import { getOnboardingData } from "@/lib/onboarding";
import { he } from "@/lib/he";
import type { LessonTopic } from "@/lib/types";

type ConversationViewProps = {
  childId: string;
  topic: LessonTopic;
};

// Topic display data
const topicData: Record<LessonTopic, { emoji: string; label: string; gradient: string }> = {
  animals: { emoji: "🦁", label: "חיות", gradient: "from-amber-400 to-orange-500" },
  colors: { emoji: "🎨", label: "צבעים", gradient: "from-pink-400 to-purple-500" },
  family: { emoji: "👨‍👩‍👧", label: "משפחה", gradient: "from-rose-400 to-pink-500" },
  food: { emoji: "🍕", label: "אוכל", gradient: "from-yellow-400 to-orange-500" },
  numbers: { emoji: "🔢", label: "מספרים", gradient: "from-blue-400 to-indigo-500" },
  body: { emoji: "🖐️", label: "גוף", gradient: "from-green-400 to-teal-500" },
  clothes: { emoji: "👕", label: "בגדים", gradient: "from-fuchsia-400 to-purple-500" },
  weather: { emoji: "🌤️", label: "מזג אוויר", gradient: "from-sky-400 to-blue-500" },
  school: { emoji: "📚", label: "בית ספר", gradient: "from-emerald-400 to-green-500" },
  toys: { emoji: "🎮", label: "צעצועים", gradient: "from-violet-400 to-purple-500" },
};

// Avatar background gradients
const avatarGradients: Record<string, string> = {
  "🦄": "from-pink-300 via-purple-300 to-indigo-400",
  "🐱": "from-amber-200 via-orange-300 to-rose-400",
  "🐼": "from-slate-200 via-gray-300 to-slate-400",
  "⭐": "from-yellow-200 via-amber-300 to-orange-400",
  "🦋": "from-cyan-300 via-blue-400 to-purple-500",
  "🐰": "from-pink-200 via-rose-300 to-pink-400",
  "🌈": "from-red-300 via-yellow-300 to-green-400",
  "🐶": "from-amber-200 via-yellow-300 to-orange-400",
};

const defaultGradient = "from-purple-300 via-pink-300 to-rose-400";

export function ConversationView({ childId, topic }: ConversationViewProps) {
  // ═══════════════════════════════════════════════════════════════════════════
  // HOOKS & STATE
  // ═══════════════════════════════════════════════════════════════════════════
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
  const [lessonRecorded, setLessonRecorded] = useState(false);

  // Get child's data from onboarding
  const [childData] = useState(() => {
    if (typeof window === "undefined") return null;
    return getOnboardingData();
  });
  const childAvatar = childData?.avatar || "⭐";
  const childName = childData?.childName || "";
  const avatarGradient = avatarGradients[childAvatar] || defaultGradient;
  const currentTopic = topicData[topic];

  // ═══════════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  useEffect(() => {
    if (isPlaying) {
      wasSpeakingRef.current = true;
    } else if (wasSpeakingRef.current) {
      wasSpeakingRef.current = false;
      avatar.setIdle();
    }
  }, [isPlaying, avatar]);

  useEffect(() => {
    if (isLessonComplete && !lessonRecorded) {
      setLessonRecorded(true);
      const wordsLearned = Math.floor(turns.filter(t => t.speaker === "CHILD").length / 2);
      recordLessonComplete({
        wordsLearned,
        correctAnswers: turns.filter(t => t.speaker === "CHILD").length,
        totalAnswers: turns.filter(t => t.speaker === "CHILD").length,
        isPerfect: true,
      });
    }
  }, [isLessonComplete, lessonRecorded, turns, recordLessonComplete]);

  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎬 PRE-START SCREEN - The "Storybook" welcome
  // ═══════════════════════════════════════════════════════════════════════════
  if (!lessonId) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-100/20 rounded-full blur-3xl" />
        </div>

        {/* Floating sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-400/60"
            style={{
              top: `${15 + Math.random() * 70}%`,
              left: `${10 + Math.random() * 80}%`,
              fontSize: `${12 + Math.random() * 12}px`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            ✦
          </motion.div>
        ))}

        {/* Main content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          
          {/* Gamification stats - subtle top bar */}
          {!gamificationLoading && level && (
            <motion.div 
              className="absolute top-6 left-0 right-0 px-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-sm">
                  <span className="text-xl">⭐</span>
                  <span className="font-bold text-amber-600">{stars.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-sm">
                  <span className="text-xl">🔥</span>
                  <span className="font-bold text-orange-500">{streak}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-sm">
                  <span className="text-xl">{level.emoji}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Welcome text */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              {childName ? `היי ${childName}!` : "היי!"}
            </h1>
            <p className="text-lg text-purple-600/80">מוכנים להרפתקה חדשה?</p>
          </motion.div>

          {/* Main avatar showcase */}
          <motion.div
            className="relative mb-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {/* Glow effect */}
            <div className={`absolute -inset-4 bg-gradient-to-br ${avatarGradient} rounded-full blur-2xl opacity-40`} />
            
            {/* Avatar circle */}
            <motion.div
              className={`relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center shadow-2xl border-4 border-white/80`}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-7xl sm:text-8xl">{childAvatar}</span>
            </motion.div>

            {/* Lily fairy floating nearby */}
            <motion.div
              className="absolute -right-4 -bottom-2 sm:right-0 sm:bottom-0"
              animate={{ 
                y: [0, -6, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                <span className="text-5xl sm:text-6xl drop-shadow-lg">🧚</span>
                {/* Sparkle trail */}
                <motion.span
                  className="absolute -top-1 -left-1 text-sm"
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ✨
                </motion.span>
              </div>
            </motion.div>
          </motion.div>

          {/* Topic card */}
          <motion.div
            className="w-full max-w-xs mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50">
              <p className="text-sm text-gray-500 text-center mb-3">היום נלמד על</p>
              <div className={`flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r ${currentTopic.gradient} shadow-md`}>
                <span className="text-4xl">{currentTopic.emoji}</span>
                <span className="text-2xl font-bold text-white drop-shadow">{currentTopic.label}</span>
              </div>
            </div>
          </motion.div>

          {/* Error message */}
          {displayError && (
            <motion.div 
              className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-red-500 text-sm text-center">{he.lesson.error}</p>
            </motion.div>
          )}

          {/* Start button */}
          <motion.button
            onClick={handleStart}
            disabled={isLoading}
            className={`
              relative px-12 py-5 rounded-full text-xl font-bold text-white
              bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500
              shadow-lg shadow-purple-500/30
              hover:shadow-xl hover:shadow-purple-500/40
              transform hover:scale-105 active:scale-95
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Shimmer effect */}
            {!isLoading && (
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
            )}
            <span className="relative flex items-center gap-3">
              {isLoading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    ✨
                  </motion.span>
                  מתכוננים...
                </>
              ) : (
                <>
                  בואו נתחיל!
                  <span className="text-2xl">🚀</span>
                </>
              )}
            </span>
          </motion.button>

          {/* Lily's encouragement */}
          <motion.p
            className="mt-6 text-purple-500/70 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            לילי מחכה ללמד אותך! ✨
          </motion.p>
        </div>

        {/* Modals */}
        {showLevelUp && newLevel && (
          <LevelUpModal level={newLevel} previousLevel={previousLevel || undefined} onClose={closeLevelUp} />
        )}
        {showAchievement && newAchievement && (
          <AchievementPopup achievement={newAchievement} onClose={closeAchievement} />
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎉 LESSON COMPLETE SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (isLessonComplete) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-purple-500 via-pink-500 to-rose-500 overflow-hidden flex items-center justify-center p-6">
        {/* Confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              style={{ left: `${Math.random() * 100}%` }}
              initial={{ y: "-10%", rotate: 0 }}
              animate={{ y: "110%", rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "linear",
              }}
            >
              {["🎉", "⭐", "✨", "🌟", "💜", "🎊"][Math.floor(Math.random() * 6)]}
            </motion.div>
          ))}
        </div>

        {/* Content card */}
        <motion.div
          className="relative bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          {/* Celebration */}
          <div className="text-center mb-6">
            <motion.div
              className="flex items-center justify-center gap-3 mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <motion.span
                className="text-5xl"
                animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {childAvatar}
              </motion.span>
              <motion.span
                className="text-6xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                🎉
              </motion.span>
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {childName ? `כל הכבוד ${childName}!` : "כל הכבוד!"}
            </h2>
            <p className="text-purple-600">
              סיימת שיעור {currentTopic.label}!
            </p>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-4 mb-8">
            <motion.div
              className="bg-gradient-to-br from-amber-100 to-yellow-200 px-5 py-3 rounded-2xl text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <div className="text-2xl font-bold text-amber-600">⭐ {stars}</div>
              <div className="text-xs text-amber-500">כוכבים</div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-orange-100 to-red-200 px-5 py-3 rounded-2xl text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <div className="text-2xl font-bold text-orange-600">🔥 {streak}</div>
              <div className="text-xs text-orange-500">ימים ברצף</div>
            </motion.div>

            {level && (
              <motion.div
                className="bg-gradient-to-br from-purple-100 to-pink-200 px-5 py-3 rounded-2xl text-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
              >
                <div className="text-2xl">{level.emoji}</div>
                <div className="text-xs text-purple-500">{level.nameHe}</div>
              </motion.div>
            )}
          </div>

          {/* Next lesson button */}
          <motion.a
            href="/topics"
            className="block w-full py-4 text-center text-xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            לשיעור הבא! 🚀
          </motion.a>
        </motion.div>

        {/* Modals */}
        {showLevelUp && newLevel && (
          <LevelUpModal level={newLevel} previousLevel={previousLevel || undefined} onClose={closeLevelUp} />
        )}
        {showAchievement && newAchievement && (
          <AchievementPopup achievement={newAchievement} onClose={closeAchievement} />
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 💬 ACTIVE LESSON SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 flex flex-col overflow-hidden">
      {/* Modals */}
      {showLevelUp && newLevel && (
        <LevelUpModal level={newLevel} previousLevel={previousLevel || undefined} onClose={closeLevelUp} />
      )}
      {showAchievement && newAchievement && (
        <AchievementPopup achievement={newAchievement} onClose={closeAchievement} />
      )}

      {/* End lesson confirmation */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEndConfirm(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">לסיים את השיעור?</h3>
              <p className="text-gray-500 mb-6">תקבלי את כל הכוכבים שצברת! ⭐</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
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

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* HEADER - Compact */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 bg-white/70 backdrop-blur-sm border-b border-white/50 px-3 py-2 flex items-center justify-between safe-area-top">
        <div className="flex items-center gap-2">
          {/* Lily indicator */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md">
              <span className="text-xl">🧚</span>
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-sm">{he.avatar.name}</h2>
            <p className="text-xs text-gray-500">{currentTopic.emoji} {currentTopic.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Stars */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-full">
            <span className="text-sm">⭐</span>
            <span className="font-bold text-amber-600 text-sm">{stars}</span>
          </div>
          
          {/* End button */}
          <button
            onClick={() => setShowEndConfirm(true)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MAIN AREA - Current message only, big and clear */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        {isLoading && turns.length === 0 && <FriendlyLoader />}

        {turns.length > 0 && (() => {
          const lastAvatarTurn = [...turns].reverse().find(t => t.speaker === "AVATAR");
          const lastChildTurn = [...turns].reverse().find(t => t.speaker === "CHILD");
          // Show child's response if it's newer than Lily's message
          const lastTurn = turns[turns.length - 1];
          const showChildResponse = lastTurn?.speaker === "CHILD";
          
          return (
            <div className="w-full max-w-sm">
              <AnimatePresence mode="wait">
                {showChildResponse && lastChildTurn ? (
                  /* Child's response - big and centered */
                  <motion.div
                    key="child-response"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center"
                  >
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center shadow-xl border-4 border-white`}>
                      <span className="text-4xl">{childAvatar}</span>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl px-5 py-4 shadow-lg">
                      <p className="text-xl font-medium">{lastChildTurn.text}</p>
                    </div>
                  </motion.div>
                ) : lastAvatarTurn ? (
                  /* Lily's message - big and centered */
                  <motion.div
                    key="lily-message"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center"
                  >
                    <motion.div 
                      className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-xl border-4 border-white"
                      animate={isPlaying ? { scale: [1, 1.08, 1] } : {}}
                      transition={{ duration: 0.6, repeat: isPlaying ? Infinity : 0 }}
                    >
                      <span className="text-4xl">🧚</span>
                    </motion.div>
                    <div className="bg-white rounded-2xl px-5 py-4 shadow-lg" dir="ltr">
                      <p className="text-xl text-gray-800">{lastAvatarTurn.text}</p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Loading indicator */}
              <AnimatePresence>
                {isLoading && turns.length > 0 && (
                  <motion.div
                    className="flex justify-center mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="flex gap-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-3 h-3 rounded-full bg-purple-400"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })()}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {displayError && (
        <div className="px-4 pb-2">
          <div className="max-w-lg mx-auto px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-500 text-sm text-center">{he.lesson.error}</p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MIC BUTTON AREA - Compact */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="flex-shrink-0 bg-white/70 backdrop-blur-sm border-t border-white/50 py-4 safe-area-bottom">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            {/* Pulse rings */}
            {isRecording && (
              <>
                <motion.div
                  className="absolute -inset-3 rounded-full bg-red-400/30"
                  animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </>
            )}

            {/* Mic button */}
            <motion.button
              className={`
                relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg
                ${isRecording
                  ? "bg-gradient-to-br from-red-500 to-rose-600"
                  : isLoading || isPlaying
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-br from-purple-500 to-pink-500"
                }
              `}
              whileHover={!isLoading && !isPlaying && !isRecording ? { scale: 1.1 } : {}}
              whileTap={!isLoading && !isPlaying ? { scale: 0.9 } : {}}
              onClick={isRecording ? handleMicRelease : handleMicPress}
              disabled={(isLoading || isPlaying) && !isRecording}
            >
              {isRecording ? (
                <Square className="w-6 h-6 text-white" />
              ) : isLoading || isPlaying ? (
                <MicOff className="w-6 h-6 text-gray-500" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </motion.button>
          </div>

          <span className={`text-xs font-medium ${isRecording ? "text-red-500" : "text-gray-500"}`}>
            {isRecording ? "מקליט... 🎤" : isPlaying ? "לילי מדברת... 🧚" : "לחצי לדבר"}
          </span>
        </div>
      </div>
    </div>
  );
}
