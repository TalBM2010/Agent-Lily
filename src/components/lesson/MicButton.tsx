"use client";

import { motion } from "framer-motion";
import { Mic, MicOff, Square } from "lucide-react";
import { he } from "@/lib/he";

type MicButtonProps = {
  isRecording: boolean;
  isDisabled: boolean;
  onPress: () => void;
  onRelease: () => void;
};

export function MicButton({
  isRecording,
  isDisabled,
  onPress,
  onRelease,
}: MicButtonProps) {
  return (
    <motion.button
      className={`
        w-20 h-20 rounded-full flex items-center justify-center
        text-white shadow-lg transition-colors
        ${isRecording
          ? "bg-red-500 hover:bg-red-600"
          : isDisabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
        }
      `}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      onClick={isRecording ? onRelease : onPress}
      disabled={isDisabled && !isRecording}
      aria-label={isRecording ? he.mic.stopRecording : he.mic.startRecording}
    >
      {isRecording ? (
        <Square className="w-8 h-8" />
      ) : isDisabled ? (
        <MicOff className="w-8 h-8" />
      ) : (
        <Mic className="w-8 h-8" />
      )}
    </motion.button>
  );
}
