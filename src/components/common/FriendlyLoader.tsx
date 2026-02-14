"use client";

import { motion } from "framer-motion";
import { he } from "@/lib/he";

export function FriendlyLoader() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-4 h-4 rounded-full bg-purple-400"
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <p className="text-gray-500 text-sm">{he.loader.text}</p>
    </div>
  );
}
