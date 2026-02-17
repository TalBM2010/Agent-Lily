"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { he } from "@/lib/he";

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
    >
      {/* Waving hand with sparkles */}
      <div className="relative">
        <motion.span
          className="text-8xl sm:text-9xl inline-block drop-shadow-lg"
          animate={{ rotate: [0, -10, 10, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          👋
        </motion.span>
        
        {/* Sparkles */}
        <motion.span 
          className="absolute -top-2 -right-2 text-3xl"
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        >
          ✨
        </motion.span>
        <motion.span 
          className="absolute -bottom-2 -left-2 text-2xl"
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
        >
          💫
        </motion.span>
      </div>

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-heading font-bold text-magic text-center">
        {he.onboarding.nameStep.title}
      </h1>
      
      {/* Subtitle */}
      <p className="text-xl text-purple-600 font-medium text-center">
        {he.onboarding.nameStep.subtitle}
      </p>

      {/* Input */}
      <div className="w-full relative">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My name is..."
          dir="ltr"
          className="
            w-full text-center text-2xl py-5 px-6 
            rounded-2xl border-3 border-purple-200 
            focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100
            bg-white text-gray-800 placeholder:text-purple-300
            shadow-magic transition-all duration-200
            font-english font-semibold
          "
          autoFocus
          maxLength={20}
        />
        
        {/* Decorative glow when focused */}
        {name && (
          <motion.div
            className="absolute -inset-1 bg-magic opacity-20 rounded-3xl -z-10 blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
          />
        )}
      </div>

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={!name.trim()}
        className={`
          relative overflow-hidden
          px-12 py-5 text-xl font-heading font-bold rounded-full
          transition-all duration-300
          ${name.trim()
            ? "btn-magic cursor-pointer"
            : "bg-purple-200 text-purple-400 cursor-not-allowed shadow-none"
          }
        `}
        whileHover={name.trim() ? { scale: 1.05 } : {}}
        whileTap={name.trim() ? { scale: 0.95 } : {}}
      >
        {/* Shimmer */}
        {name.trim() && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        )}
        
        <span className="relative z-10 flex items-center gap-2">
          {he.onboarding.nameStep.next}
          {name.trim() && <span>→</span>}
        </span>
      </motion.button>
    </motion.form>
  );
}
