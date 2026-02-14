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
      <motion.span
        className="text-8xl"
        animate={{ rotate: [0, -10, 10, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
      >
        👋
      </motion.span>

      <h1 className="text-4xl font-bold text-purple-600">
        {he.onboarding.nameStep.title}
      </h1>
      <p className="text-xl text-gray-600">
        {he.onboarding.nameStep.subtitle}
      </p>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={he.onboarding.nameStep.placeholder}
        className="w-full text-center text-2xl py-4 px-6 rounded-2xl border-3 border-purple-200 focus:border-purple-500 focus:outline-none bg-white text-gray-800 placeholder:text-gray-300"
        autoFocus
        maxLength={20}
      />

      <motion.button
        type="submit"
        disabled={!name.trim()}
        className={`
          px-10 py-4 text-xl font-bold rounded-full shadow-lg transition-all
          ${name.trim()
            ? "bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 cursor-pointer"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }
        `}
        whileTap={name.trim() ? { scale: 0.95 } : {}}
      >
        {he.onboarding.nameStep.next}
      </motion.button>
    </motion.form>
  );
}
