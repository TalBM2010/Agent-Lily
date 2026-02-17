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
import { getOnboardingData } from "@/lib/onboarding";
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

  // Get child's chosen companion avatar from onboarding
  const [companionData] = useState(() => {
    if (typeof window === "undefined") return null;
    return getOnboardingData();
  });
  const companionEmoji = companionData?.avatar || "⭐";
  const childName = companionData?.childName || "";
  const wasSpeakingRef = useRef(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [starsAnimating, setStarsAnimating] = useState(false);
  const [lessonRecorded, setLessonRecorded] = useState(false);

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
      setStarsAnimating(true);
      recordLessonComplete({
        wordsLearned,
        correctAnswers: turns.filter(t => t.speaker === "CHILD").length,
        totalAnswers: turns.filter(t => t.speaker === "CHILD").length,
        isPerfect: true,
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

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎨 AVATAR PANEL - Right side magical background
  // ═══════════════════════════════════════════════════════════════════════════
  const avatarPanel = (
    <div className="relative overflow-hidden flex items-center justify-center h-[35vh] md:h-full bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-500">
      {/* Magical particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-30"
            initial={{ 
              x: `${Math.random() * 100}%`, 
              y: `${Math.random() * 100}%`,
              scale: 0.5 + Math.random() * 0.5,
            }}
            animate={{ 
              y: [null, "-20%", null],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>
      
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
      
      {/* Avatar - shows child's chosen avatar with floating Lily */}
      <AvatarDisplay 
        state={avatar.state} 
        childAvatar={companionEmoji} 
        childName={childName}
      />
      
      {/* Topic badge - bottom left */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full glass-dark">
        <span className="text-xl">{topicEmojis[topic]}</span>
        <span className="text-sm font-medium text-white/90">{topicLabel}</span>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 🚀 PRE-START STATE
  // ═══════════════════════════════════════════════════════════════════════════
  if (!lessonId) {
    return (
      <div className="h-screen grid grid-cols-1 md:grid-cols-5">
        <div className="md:col-span-2 flex flex-col items-center justify-center h-[65vh] md:h-auto glass relative md:order-1 order-2 p-6">
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

          {/* Content */}
          <div className="flex flex-col items-center gap-6 mt-16">
            {displayError && (
              <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-500 text-sm text-center">{he.lesson.error}</p>
              </div>
            )}

            {/* Lily and companion together */}
            <div className="flex items-end justify-center gap-4">
              {/* Child's companion */}
              <motion.div
                className="relative"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              >
                <span className="text-6xl">{companionEmoji}</span>
              </motion.div>
              
              {/* Lily character waving */}
              <motion.div
                className="relative"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-8xl">🧚</span>
                <motion.span
                  className="absolute -top-2 -right-2 text-2xl"
                  animate={{ scale: [0, 1, 0], rotate: [0, 15, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ✨
                </motion.span>
              </motion.div>
            </div>

            {/* Welcome text */}
            <div className="text-center">
              <h2 className="text-2xl font-heading font-bold text-magic mb-2">
                {childName ? `${childName}, מוכנה ללמוד ${topicLabel}?` : `מוכנה ללמוד ${topicLabel}?`}
              </h2>
              <p className="text-purple-500">לחצי כדי להתחיל! 🎯</p>
            </div>

            {/* Start button */}
            <motion.button
              onClick={handleStart}
              disabled={isLoading}
              className="relative btn-magic text-xl px-12 py-5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Shimmer */}
              {!isLoading && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <>טוען...</>
                ) : (
                  <>
                    בואי נתחיל!
                    <span className="text-2xl">🚀</span>
                  </>
                )}
              </span>
            </motion.button>
          </div>
        </div>
        <div className="md:col-span-3 md:order-2 order-1">{avatarPanel}</div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 🎉 LESSON COMPLETE STATE
  // ═══════════════════════════════════════════════════════════════════════════
  if (isLessonComplete) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 p-6">
        {/* Confetti background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-3xl"
              initial={{ 
                x: `${Math.random() * 100}%`, 
                y: "-10%",
                rotate: 0,
              }}
              animate={{ 
                y: "110%",
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
              }}
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

        {/* Modals */}
        {showLevelUp && newLevel && (
          <LevelUpModal
            level={newLevel}
            previousLevel={previousLevel || undefined}
            onClose={closeLevelUp}
          />
        )}
        {showAchievement && newAchievement && (
          <AchievementPopup achievement={newAchievement} onClose={closeAchievement} />
        )}

        {/* Content card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring" as const, stiffness: 200, damping: 20 }}
          className="relative card-magic p-8 max-w-md w-full text-center shadow-magic-lg"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-magic opacity-20 rounded-[2rem] blur-xl" />
          
          <div className="relative">
            {/* Child's companion celebrating */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <motion.span
                className="text-6xl inline-block"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{ duration: 0.8, delay: 0.3, repeat: 2 }}
              >
                {companionEmoji}
              </motion.span>
              <motion.span
                className="text-8xl inline-block"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0],
                }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                🎉
              </motion.span>
            </div>

            <h2 className="text-3xl font-heading font-bold text-magic mb-2">
              {childName ? `כל הכבוד ${childName}!` : "כל הכבוד!"}
            </h2>
            <p className="text-purple-600 text-lg mb-6">
              סיימת שיעור ב{topicLabel}!
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-4 mb-8">
              <motion.div 
                className="bg-gradient-to-br from-yellow-100 to-amber-100 px-5 py-3 rounded-2xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" as const }}
              >
                <div className="text-2xl font-bold text-amber-600">⭐ {stars}</div>
                <div className="text-xs text-amber-500">כוכבים</div>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-orange-100 to-red-100 px-5 py-3 rounded-2xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" as const }}
              >
                <div className="text-2xl font-bold text-orange-600">🔥 {streak}</div>
                <div className="text-xs text-orange-500">ימים ברצף</div>
              </motion.div>
              
              {level && (
                <motion.div 
                  className="bg-gradient-to-br from-purple-100 to-pink-100 px-5 py-3 rounded-2xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" as const }}
                >
                  <div className="text-2xl">{level.emoji}</div>
                  <div className="text-xs text-purple-500">{level.nameHe}</div>
                </motion.div>
              )}
            </div>

            {/* Next lesson button */}
            <motion.a
              href="/topics"
              className="inline-block w-full btn-magic text-xl py-5"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              לשיעור הבא! 🚀
            </motion.a>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 💬 ACTIVE LESSON STATE
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-5">
      {/* Modals */}
      {showLevelUp && newLevel && (
        <LevelUpModal
          level={newLevel}
          previousLevel={previousLevel || undefined}
          onClose={closeLevelUp}
        />
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
            <div className="absolute inset-0 bg-purple-900/50 backdrop-blur-sm" onClick={() => setShowEndConfirm(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative card-magic p-6 max-w-sm w-full shadow-magic-lg"
            >
              <h3 className="text-xl font-heading font-bold text-purple-700 mb-2">
                לסיים את השיעור?
              </h3>
              <p className="text-purple-500 mb-6">
                אם תסיימי עכשיו תקבלי את הכוכבים שצברת! ⭐
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-3 px-4 bg-purple-100 text-purple-700 font-heading font-bold rounded-xl hover:bg-purple-200 transition-colors"
                >
                  להמשיך
                </button>
                <button
                  onClick={handleEndLesson}
                  className="flex-1 py-3 px-4 btn-magic rounded-xl"
                >
                  לסיים 🎉
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* LEFT PANEL - Chat */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="md:col-span-2 flex flex-col h-[65vh] md:h-screen glass md:rounded-none md:rounded-r-3xl shadow-magic-lg md:order-1 order-2">
        
        {/* Gamification header */}
        {!gamificationLoading && level && (
          <div className="px-4 pt-4">
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

        {/* Chat header */}
        <div className="px-5 py-3 border-b border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-magic flex items-center justify-center">
                <span className="text-lg">🧚</span>
              </div>
              <div>
                <h2 className="font-heading font-bold text-purple-700">{he.avatar.name}</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-purple-400">מקשיבה</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Child's companion avatar */}
              <motion.div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-xl">{companionEmoji}</span>
                {childName && (
                  <span className="text-sm font-medium text-purple-600">{childName}</span>
                )}
              </motion.div>

              {/* End lesson button */}
              <button
                onClick={() => setShowEndConfirm(true)}
                className="p-2.5 hover:bg-purple-100 rounded-full transition-colors text-purple-400 hover:text-purple-600"
                title="סיים שיעור"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
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
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-magic flex items-center justify-center mr-2 shadow-sm">
                    <span className="text-sm">🧚</span>
                  </div>
                )}
                <div
                  dir={turn.speaker === "AVATAR" ? "ltr" : undefined}
                  className={`max-w-[80%] px-4 py-3 font-english ${
                    turn.speaker === "AVATAR"
                      ? "bg-white border border-purple-100 text-purple-800 rounded-2xl rounded-tl-md shadow-sm"
                      : "bg-magic text-white rounded-2xl rounded-tr-md shadow-magic"
                  }`}
                >
                  {turn.text}
                </div>
                {turn.speaker === "CHILD" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center ml-2 shadow-sm">
                    <span className="text-sm">{companionEmoji}</span>
                  </div>
                )}
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
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-magic flex items-center justify-center mr-2 shadow-sm">
                  <span className="text-sm">🧚</span>
                </div>
                <div className="bg-white border border-purple-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-purple-400"
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
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
          <div className="px-4 pb-2">
            <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-500 text-sm text-center">{he.lesson.error}</p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* MIC BUTTON AREA */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center gap-3 py-6 border-t border-purple-100 bg-white/50">
          <div className="relative">
            {/* Outer glow ring when idle */}
            {!isRecording && !isMicDisabled && (
              <motion.div
                className="absolute -inset-4 rounded-full bg-purple-400/20"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            
            {/* Recording pulse rings */}
            {isRecording && (
              <>
                <motion.div
                  className="absolute -inset-4 rounded-full bg-red-400/30"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -inset-4 rounded-full bg-red-400/30"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
                />
              </>
            )}

            {/* The mic button */}
            <motion.button
              className={`
                relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg
                ${isRecording
                  ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30"
                  : isMicDisabled
                    ? "bg-purple-200 cursor-not-allowed"
                    : "btn-magic shadow-purple-500/30"
                }
              `}
              whileHover={!isMicDisabled && !isRecording ? { scale: 1.1 } : {}}
              whileTap={!isMicDisabled ? { scale: 0.9 } : {}}
              onClick={isRecording ? handleMicRelease : handleMicPress}
              disabled={isMicDisabled && !isRecording}
            >
              {isRecording ? (
                <Square className="w-7 h-7 text-white" />
              ) : isMicDisabled ? (
                <MicOff className="w-7 h-7 text-purple-400" />
              ) : (
                <Mic className="w-7 h-7 text-white" />
              )}
            </motion.button>
          </div>

          {/* Instruction text */}
          <span className={`text-sm font-medium ${isRecording ? "text-red-500" : "text-purple-400"}`}>
            {isRecording ? "מקליטה... לחצי לשלוח 🎤" : "לחצי לדבר"}
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* RIGHT PANEL - Avatar */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="md:col-span-3 md:order-2 order-1">{avatarPanel}</div>
    </div>
  );
}
