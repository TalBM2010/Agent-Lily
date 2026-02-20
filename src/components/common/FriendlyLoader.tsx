"use client";

import { motion } from "framer-motion";
import { he } from "@/lib/he";

export function FriendlyLoader() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <motion.div 
        className="text-4xl"
        animate={{ 
          y: [0, -8, 0],
          rotate: [0, 5, -5, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🌸
      </motion.div>
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-garden-green"
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.12,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <p className="text-text-light text-sm font-medium">{he.loader.text}</p>
    </div>
  );
}
