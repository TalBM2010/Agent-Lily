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
      className="flex flex-col items-center gap-8 w-full max-w-sm"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
    >
      {/* Lily introduction */}
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
      >
        <motion.span
          className="text-7xl sm:text-8xl inline-block"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🧚
        </motion.span>
        
        {/* Sparkles around Lily */}
        <motion.span 
          className="absolute -top-2 -right-2 text-2xl"
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.span>
        <motion.span 
          className="absolute -bottom-1 -left-3 text-xl"
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
        >
          💫
        </motion.span>
      </motion.div>

      {/* Title */}
      <div className="text-center">
        <motion.h1 
          className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          היי! אני לילי 👋
        </motion.h1>
        <motion.p 
          className="text-lg text-purple-600/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          נעים להכיר! מה השם שלך?
        </motion.p>
      </div>

      {/* Input card */}
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/50">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="הקלידו את השם..."
            dir="rtl"
            className="
              w-full text-center text-2xl py-4 px-6 
              rounded-2xl border-2 border-purple-100 
              focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100
              bg-white text-gray-800 placeholder:text-gray-300
              transition-all duration-200 font-medium
            "
            autoFocus
            maxLength={20}
          />
        </div>
      </motion.div>

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={!name.trim()}
        className={`
          relative px-12 py-5 rounded-full text-xl font-bold
          transition-all duration-300 transform
          ${name.trim()
            ? "text-white bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105 active:scale-95"
            : "text-gray-400 bg-gray-200 cursor-not-allowed"
          }
        `}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={name.trim() ? { scale: 1.05 } : {}}
        whileTap={name.trim() ? { scale: 0.95 } : {}}
      >
        {/* Shimmer */}
        {name.trim() && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        )}
        
        <span className="relative flex items-center gap-2">
          המשך
          {name.trim() && <span>→</span>}
        </span>
      </motion.button>
    </motion.form>
  );
}
