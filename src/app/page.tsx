"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NameStep } from "@/components/onboarding/NameStep";
import { AvatarStep } from "@/components/onboarding/AvatarStep";
import { saveOnboardingData } from "@/lib/onboarding";

const DEFAULT_CHILD_ID = "test-child-1";

type Step = "name" | "avatar";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("name");
  const [childName, setChildName] = useState("");

  function handleNameNext(name: string) {
    setChildName(name);
    setStep("avatar");
  }

  async function handleAvatarComplete(avatar: string) {
    saveOnboardingData({ childName, avatar });

    // Update child name in DB (fire-and-forget)
    fetch(`/api/child/${DEFAULT_CHILD_ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: childName }),
    }).catch(() => {
      // Non-critical — AI prompts will still work with DB name
    });

    router.push("/topics");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-10 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-100/30 rounded-full blur-3xl" />
      </div>

      {/* Floating sparkles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-400/50"
          style={{
            top: `${10 + Math.random() * 80}%`,
            left: `${5 + Math.random() * 90}%`,
            fontSize: `${10 + Math.random() * 14}px`,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          ✦
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 min-h-screen">
        <AnimatePresence mode="wait">
          {step === "name" ? (
            <NameStep key="name" onNext={handleNameNext} />
          ) : (
            <AvatarStep
              key="avatar"
              childName={childName}
              onComplete={handleAvatarComplete}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
