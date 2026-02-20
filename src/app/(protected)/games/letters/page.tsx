"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Volume2, Star, Check, X, Home, RotateCcw, 
  ChevronLeft, ChevronRight, Sparkles, Trophy
} from "lucide-react";
import { PageContainer } from "@/components/navigation";

// Alphabet data
const ALPHABET = [
  { upper: "A", lower: "a", sound: "ay", hebrewSound: "אֵיי" },
  { upper: "B", lower: "b", sound: "bee", hebrewSound: "בִּי" },
  { upper: "C", lower: "c", sound: "see", hebrewSound: "סִי" },
  { upper: "D", lower: "d", sound: "dee", hebrewSound: "דִּי" },
  { upper: "E", lower: "e", sound: "ee", hebrewSound: "אִי" },
  { upper: "F", lower: "f", sound: "eff", hebrewSound: "אֶף" },
  { upper: "G", lower: "g", sound: "jee", hebrewSound: "ג׳ִי" },
  { upper: "H", lower: "h", sound: "aych", hebrewSound: "אֵייְץ׳" },
  { upper: "I", lower: "i", sound: "eye", hebrewSound: "אַי" },
  { upper: "J", lower: "j", sound: "jay", hebrewSound: "ג׳ֵיי" },
  { upper: "K", lower: "k", sound: "kay", hebrewSound: "קֵיי" },
  { upper: "L", lower: "l", sound: "ell", hebrewSound: "אֶל" },
  { upper: "M", lower: "m", sound: "em", hebrewSound: "אֶם" },
  { upper: "N", lower: "n", sound: "en", hebrewSound: "אֶן" },
  { upper: "O", lower: "o", sound: "oh", hebrewSound: "אוֹ" },
  { upper: "P", lower: "p", sound: "pee", hebrewSound: "פִּי" },
  { upper: "Q", lower: "q", sound: "cue", hebrewSound: "קְיוּ" },
  { upper: "R", lower: "r", sound: "ar", hebrewSound: "אָר" },
  { upper: "S", lower: "s", sound: "ess", hebrewSound: "אֶס" },
  { upper: "T", lower: "t", sound: "tee", hebrewSound: "טִי" },
  { upper: "U", lower: "u", sound: "you", hebrewSound: "יוּ" },
  { upper: "V", lower: "v", sound: "vee", hebrewSound: "וִי" },
  { upper: "W", lower: "w", sound: "double-you", hebrewSound: "דַבְּלְיוּ" },
  { upper: "X", lower: "x", sound: "ex", hebrewSound: "אֶקְס" },
  { upper: "Y", lower: "y", sound: "why", hebrewSound: "וַואי" },
  { upper: "Z", lower: "z", sound: "zee", hebrewSound: "זִי" },
];

type GameMode = "explore" | "quiz-listen" | "quiz-match" | "complete";
type QuizType = "listen" | "match";

interface QuizQuestion {
  correctIndex: number;
  options: typeof ALPHABET[number][];
  type: QuizType;
}

export default function LettersGamePage() {
  const router = useRouter();
  const [childId, setChildId] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>("explore");
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [learnedLetters, setLearnedLetters] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  // Quiz state
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [starsEarned, setStarsEarned] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentLetter = ALPHABET[currentLetterIndex];

  useEffect(() => {
    const storedChildId = localStorage.getItem("selectedChildId");
    if (!storedChildId) {
      router.push("/children");
      return;
    }
    setChildId(storedChildId);

    // Load learned letters from localStorage
    const saved = localStorage.getItem(`letters-progress-${storedChildId}`);
    if (saved) {
      setLearnedLetters(new Set(JSON.parse(saved)));
    }
  }, [router]);

  const saveProgress = useCallback((letters: Set<string>) => {
    if (childId) {
      localStorage.setItem(`letters-progress-${childId}`, JSON.stringify([...letters]));
    }
  }, [childId]);

  // Play letter sound using TTS API
  const playSound = useCallback(async (letter: typeof ALPHABET[number]) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    try {
      const response = await fetch("/api/speech/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: `${letter.upper}. ${letter.sound}.`,
          voice: "EXAVITQu4vr4xnSDxMaL" // Bella voice
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
        };
      } else {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("TTS error:", error);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const markAsLearned = useCallback(() => {
    const newLearned = new Set(learnedLetters);
    newLearned.add(currentLetter.upper);
    setLearnedLetters(newLearned);
    saveProgress(newLearned);
  }, [currentLetter, learnedLetters, saveProgress]);

  const goToNextLetter = () => {
    if (currentLetterIndex < ALPHABET.length - 1) {
      setCurrentLetterIndex(currentLetterIndex + 1);
      setShowHint(false);
    }
  };

  const goToPrevLetter = () => {
    if (currentLetterIndex > 0) {
      setCurrentLetterIndex(currentLetterIndex - 1);
      setShowHint(false);
    }
  };

  // Generate quiz question
  const generateQuizQuestion = useCallback((type: QuizType) => {
    const correctIndex = Math.floor(Math.random() * ALPHABET.length);
    const correctLetter = ALPHABET[correctIndex];
    
    // Get 3 random wrong options
    const wrongIndices: number[] = [];
    while (wrongIndices.length < 3) {
      const idx = Math.floor(Math.random() * ALPHABET.length);
      if (idx !== correctIndex && !wrongIndices.includes(idx)) {
        wrongIndices.push(idx);
      }
    }
    
    const options = [correctLetter, ...wrongIndices.map(i => ALPHABET[i])];
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    const newCorrectIndex = options.findIndex(o => o.upper === correctLetter.upper);
    
    setQuizQuestion({
      correctIndex: newCorrectIndex,
      options,
      type,
    });
    setSelectedAnswer(null);
    setIsCorrect(null);
    
    // Play sound for listen quiz
    if (type === "listen") {
      setTimeout(() => playSound(correctLetter), 500);
    }
  }, [playSound]);

  const startQuiz = (type: QuizType) => {
    setGameMode(type === "listen" ? "quiz-listen" : "quiz-match");
    setScore(0);
    setQuestionsAnswered(0);
    setStarsEarned(0);
    generateQuizQuestion(type);
  };

  const handleQuizAnswer = async (answerIndex: number) => {
    if (selectedAnswer !== null || !quizQuestion) return;
    
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === quizQuestion.correctIndex;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
      setStarsEarned(starsEarned + 1);
    }
    
    setQuestionsAnswered(questionsAnswered + 1);
    
    // Auto advance after delay
    setTimeout(() => {
      if (questionsAnswered + 1 >= 10) {
        // Quiz complete
        setGameMode("complete");
        // Award stars
        if (childId && starsEarned + (correct ? 1 : 0) > 0) {
          awardStars(starsEarned + (correct ? 1 : 0));
        }
      } else {
        generateQuizQuestion(quizQuestion.type);
      }
    }, 1500);
  };

  const awardStars = async (amount: number) => {
    if (!childId) return;
    try {
      await fetch(`/api/gamification/stars/${childId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount, 
          reason: "letters_game" 
        }),
      });
    } catch (error) {
      console.error("Failed to award stars:", error);
    }
  };

  const resetGame = () => {
    setGameMode("explore");
    setCurrentLetterIndex(0);
    setScore(0);
    setQuestionsAnswered(0);
    setStarsEarned(0);
  };

  // Explore Mode UI
  if (gameMode === "explore") {
    return (
      <PageContainer title="גלי האותיות" showBack={true}>
        <div className="max-w-lg mx-auto space-y-4">
          {/* Progress bar - Storybook style */}
          <motion.div
            className="card-storybook p-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex gap-1">
              {ALPHABET.map((letter, i) => (
                <div
                  key={letter.upper}
                  className={`
                    h-2 flex-1 rounded-full transition-colors
                    ${learnedLetters.has(letter.upper) 
                      ? "bg-garden-green" 
                      : i === currentLetterIndex
                        ? "bg-sunshine"
                        : "bg-cream-200"
                    }
                  `}
                />
              ))}
            </div>
            <p className="text-center text-xs text-text-light mt-1.5">
              {learnedLetters.size} / {ALPHABET.length} אותיות נלמדו
            </p>
          </motion.div>

          {/* Main Letter Card - Book page style */}
          <motion.div
            className="card-storybook p-8 text-center border-3 border-wood-light"
            key={currentLetterIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Corner decorations */}
            <div className="absolute top-3 left-3 text-lg opacity-30">🌿</div>
            <div className="absolute top-3 right-3 text-lg opacity-30">🌸</div>
            
            {/* Letter display */}
            <div className="mb-6">
              <motion.div
                className="text-8xl font-bold font-english text-garden-green-dark"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentLetter.upper}{currentLetter.lower}
              </motion.div>
              
              {learnedLetters.has(currentLetter.upper) && (
                <motion.div
                  className="inline-flex items-center gap-1 bg-garden-green-light text-garden-green-dark px-3 py-1 rounded-full mt-2 border border-garden-green"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">נלמד!</span>
                </motion.div>
              )}
            </div>

            {/* Sound button - Flower style */}
            <motion.button
              onClick={() => playSound(currentLetter)}
              className={`
                mx-auto mb-4 w-20 h-20 rounded-full
                bg-lily-gradient
                text-white shadow-lily flex items-center justify-center
                border-3 border-lily-pink-light
                ${isPlaying ? "animate-pulse" : ""}
              `}
              whileTap={{ scale: 0.9 }}
              disabled={isPlaying}
            >
              <Volume2 className="w-10 h-10" />
            </motion.button>

            {/* Sound info */}
            <div className="space-y-2">
              <p className="text-2xl font-english font-bold text-text-dark">
                "{currentLetter.sound}"
              </p>
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-sm text-garden-green-dark underline"
              >
                {showHint ? "הסתרת עזרה" : "איך מבטאים?"}
              </button>
              <AnimatePresence>
                {showHint && (
                  <motion.p
                    className="text-lg text-text-light"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {currentLetter.hebrewSound}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <motion.button
              onClick={goToPrevLetter}
              disabled={currentLetterIndex === 0}
              className="p-4 card-storybook disabled:opacity-40"
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-6 h-6 text-text-dark" />
            </motion.button>

            <motion.button
              onClick={() => {
                markAsLearned();
                goToNextLetter();
              }}
              className="flex-1 btn-primary"
              whileTap={{ scale: 0.98 }}
            >
              {learnedLetters.has(currentLetter.upper) ? "הבא!" : "למדתי! ✨"}
            </motion.button>

            <motion.button
              onClick={goToNextLetter}
              disabled={currentLetterIndex === ALPHABET.length - 1}
              className="p-4 card-storybook disabled:opacity-40"
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-6 h-6 text-text-dark" />
            </motion.button>
          </div>

          {/* Quiz buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <motion.button
              onClick={() => startQuiz("listen")}
              className="card-storybook p-4 text-center border-2 border-story-blue hover:bg-story-blue-light transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Volume2 className="w-6 h-6 mx-auto mb-2 text-story-blue-dark" />
              <span className="font-bold font-heading text-text-dark block">חידון שמיעה</span>
              <p className="text-xs text-text-light">מצאי את האות ששמעת</p>
            </motion.button>

            <motion.button
              onClick={() => startQuiz("match")}
              className="card-storybook p-4 text-center border-2 border-sunshine hover:bg-sunshine-light transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl block mb-2 font-english font-bold text-sunshine-dark">Aa</span>
              <span className="font-bold font-heading text-text-dark block">חידון התאמה</span>
              <p className="text-xs text-text-light">התאימי גדולות לקטנות</p>
            </motion.button>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Quiz Mode UI (Listen or Match)
  if (gameMode === "quiz-listen" || gameMode === "quiz-match") {
    const isListenQuiz = gameMode === "quiz-listen";
    
    return (
      <PageContainer title={isListenQuiz ? "חידון שמיעה" : "חידון התאמה"} showBack={true}>
        <div className="max-w-lg mx-auto space-y-4">
          {/* Score display */}
          <motion.div
            className="flex items-center justify-between card-storybook p-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-sunshine-dark" />
              <span className="font-bold text-text-dark">{score}</span>
            </div>
            <div className="text-text-light">
              שאלה {questionsAnswered + 1} / 10
            </div>
            <div className="w-16 h-2 bg-cream-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-garden-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${(questionsAnswered / 10) * 100}%` }}
              />
            </div>
          </motion.div>

          {/* Question */}
          {quizQuestion && (
            <motion.div
              className="card-storybook p-6 text-center border-3 border-wood-light"
              key={questionsAnswered}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {isListenQuiz ? (
                <>
                  <p className="text-lg text-text-dark mb-4 font-heading">איזו אות שמעת?</p>
                  <motion.button
                    onClick={() => playSound(quizQuestion.options[quizQuestion.correctIndex])}
                    className="mx-auto w-24 h-24 rounded-full bg-story-gradient text-white shadow-warm-lg flex items-center justify-center border-3 border-story-blue-light"
                    whileTap={{ scale: 0.9 }}
                    animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
                  >
                    <Volume2 className="w-12 h-12" />
                  </motion.button>
                </>
              ) : (
                <>
                  <p className="text-lg text-text-dark mb-4 font-heading">מצאי את האות הקטנה:</p>
                  <motion.div
                    className="text-7xl font-bold font-english text-garden-green-dark"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {quizQuestion.options[quizQuestion.correctIndex].upper}
                  </motion.div>
                </>
              )}
            </motion.div>
          )}

          {/* Answer options */}
          {quizQuestion && (
            <div className="grid grid-cols-2 gap-3">
              {quizQuestion.options.map((option, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrectAnswer = i === quizQuestion.correctIndex;
                const showResult = selectedAnswer !== null;

                let buttonStyle = "card-storybook";
                if (showResult) {
                  if (isCorrectAnswer) {
                    buttonStyle = "bg-garden-green-light border-3 border-garden-green";
                  } else if (isSelected && !isCorrect) {
                    buttonStyle = "bg-lily-pink-light border-3 border-lily-pink-dark";
                  }
                }

                return (
                  <motion.button
                    key={i}
                    onClick={() => handleQuizAnswer(i)}
                    disabled={selectedAnswer !== null}
                    className={`
                      p-6 rounded-xl font-english text-4xl font-bold
                      ${buttonStyle}
                      disabled:cursor-default
                    `}
                    whileHover={selectedAnswer === null ? { scale: 1.05 } : {}}
                    whileTap={selectedAnswer === null ? { scale: 0.95 } : {}}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <span className="text-text-dark">
                      {isListenQuiz ? (
                        `${option.upper}${option.lower}`
                      ) : (
                        option.lower
                      )}
                    </span>
                    {showResult && isCorrectAnswer && (
                      <Check className="w-6 h-6 mx-auto mt-2 text-garden-green-dark" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <X className="w-6 h-6 mx-auto mt-2 text-lily-pink-dark" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Feedback */}
          <AnimatePresence>
            {isCorrect !== null && (
              <motion.div
                className={`
                  text-center p-4 rounded-xl font-bold text-lg
                  ${isCorrect 
                    ? "bg-garden-green-light text-garden-green-dark border border-garden-green" 
                    : "bg-lily-pink-light text-lily-pink-dark border border-lily-pink"
                  }
                `}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {isCorrect ? (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    נכון מאוד! 🎉
                    <Sparkles className="w-5 h-5" />
                  </span>
                ) : (
                  "לא נורא, ננסה שוב! 💪"
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageContainer>
    );
  }

  // Complete screen
  if (gameMode === "complete") {
    const percentage = Math.round((score / 10) * 100);
    
    return (
      <PageContainer showTopNav={false} showBottomNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            className="max-w-sm mx-auto text-center space-y-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Celebration */}
            <motion.div
              className="text-6xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: 3 }}
            >
              🎉
            </motion.div>

            <h1 className="text-3xl font-bold font-heading text-text-dark">כל הכבוד!</h1>
            
            {/* Score card */}
            <div className="card-storybook p-6 border-3 border-wood-light">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="w-8 h-8 text-sunshine-dark" />
                <span className="text-4xl font-bold text-text-dark">{score}/10</span>
              </div>
              
              <div className="w-full h-4 bg-cream-200 rounded-full overflow-hidden mb-4 border border-cream-300">
                <motion.div
                  className={`h-full ${
                    percentage >= 80 
                      ? "bg-garden-gradient" 
                      : percentage >= 50
                        ? "bg-sunshine-gradient"
                        : "bg-lily-gradient"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>

              {/* Stars earned */}
              <motion.div
                className="flex items-center justify-center gap-2 bg-sunshine-light p-3 rounded-xl border border-sunshine"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 }}
              >
                <Star className="w-6 h-6 text-sunshine-dark" />
                <span className="text-xl font-bold text-text-dark">
                  +{starsEarned} כוכבים!
                </span>
              </motion.div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <motion.button
                onClick={resetGame}
                className="w-full btn-primary flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw className="w-5 h-5" />
                לשחק שוב
              </motion.button>

              <motion.button
                onClick={() => router.push("/games")}
                className="w-full btn-outline flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="w-5 h-5" />
                חזרה למשחקים
              </motion.button>
            </div>
          </motion.div>
        </div>
      </PageContainer>
    );
  }

  return null;
}
