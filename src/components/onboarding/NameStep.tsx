"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

type NameStepProps = {
  onNext: (name: string) => void;
};

export function NameStep({ onNext }: NameStepProps) {
  const [name, setName] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onNext(trimmed);
  }

  function scrollToCard() {
    setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
        className="relative mb-3"
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
      <p className="text-base text-purple-600/80 mb-4 text-center">
        נעים להכיר! מה השם שלך?
      </p>

      {/* Input card with button inside */}
      <div 
        ref={cardRef}
        className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={scrollToCard}
          onClick={scrollToCard}
          placeholder="הקלידו את השם..."
          dir="rtl"
          className="
            w-full text-center text-xl py-3 px-4 mb-3
            rounded-xl border-2 border-purple-100 
            focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100
            bg-white text-gray-800 placeholder:text-gray-300
            transition-all duration-200 font-medium
          "
          autoComplete="off"
          autoCapitalize="words"
          maxLength={20}
        />
        
        {/* Button inside card */}
        <motion.button
          type="submit"
          disabled={!name.trim()}
          className={`
            w-full py-3 rounded-xl text-lg font-bold
            transition-all duration-300
            ${name.trim()
              ? "text-white bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 shadow-md active:scale-95"
              : "text-gray-400 bg-gray-100 cursor-not-allowed"
            }
          `}
          whileTap={name.trim() ? { scale: 0.97 } : {}}
        >
          <span className="flex items-center justify-center gap-2">
            המשך
            {name.trim() && <span>→</span>}
          </span>
        </motion.button>
      </div>
    </motion.form>
  );
}
