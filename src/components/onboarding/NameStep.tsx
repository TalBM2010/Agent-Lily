"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type NameStepProps = {
  onNext: (name: string) => void;
};

export function NameStep({ onNext }: NameStepProps) {
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onNext(trimmed);
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex flex-col items-center w-full max-w-sm px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Lily - centered nicely */}
      <motion.div
        className="relative mb-6"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-6xl">🧚</span>
        <motion.span 
          className="absolute -top-1 -right-2 text-lg"
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.span>
      </motion.div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 text-center">
        היי! אני לילי 👋
      </h1>
      <p className="text-base text-purple-600/80 mb-6 text-center">
        נעים להכיר! מה השם שלך?
      </p>

      {/* Input card */}
      <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="הקלידו את השם..."
          dir="rtl"
          className="
            w-full text-center text-xl py-3 px-4 
            rounded-xl border-2 border-purple-100 
            focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100
            bg-white text-gray-800 placeholder:text-gray-300
            transition-all duration-200 font-medium
          "
          autoFocus
          maxLength={20}
        />
      </div>

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={!name.trim()}
        className={`
          relative px-10 py-4 rounded-full text-lg font-bold
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
