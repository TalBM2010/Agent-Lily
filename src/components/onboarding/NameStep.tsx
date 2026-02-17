"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

type NameStepProps = {
  onNext: (name: string) => void;
};

export function NameStep({ onNext }: NameStepProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onNext(trimmed);
  }

  function handleFocus() {
    // Scroll input into view when keyboard opens
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex flex-col items-center w-full max-w-sm px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Lily */}
      <motion.div
        className="relative mb-4"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-5xl">🧚</span>
        <motion.span 
          className="absolute -top-1 -right-1 text-base"
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.span>
      </motion.div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-1 text-center">
        היי! אני לילי 👋
      </h1>
      <p className="text-base text-purple-600/80 mb-5 text-center">
        נעים להכיר! מה השם שלך?
      </p>

      {/* Input card */}
      <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50 mb-5">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={handleFocus}
          placeholder="הקלידו את השם..."
          dir="rtl"
          className="
            w-full text-center text-xl py-3 px-4 
            rounded-xl border-2 border-purple-100 
            focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100
            bg-white text-gray-800 placeholder:text-gray-300
            transition-all duration-200 font-medium
          "
          autoComplete="off"
          autoCapitalize="words"
          maxLength={20}
        />
      </div>

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={!name.trim()}
        className={`
          px-10 py-4 rounded-full text-lg font-bold
          transition-all duration-300
          ${name.trim()
            ? "text-white bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 shadow-lg shadow-purple-500/30 active:scale-95"
            : "text-gray-400 bg-gray-200 cursor-not-allowed"
          }
        `}
        whileTap={name.trim() ? { scale: 0.95 } : {}}
      >
        <span className="flex items-center gap-2">
          המשך
          {name.trim() && <span>→</span>}
        </span>
      </motion.button>
    </motion.form>
  );
}
