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

    fetch(`/api/child/${DEFAULT_CHILD_ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: childName }),
    }).catch(() => {});

    router.push("/topics");
  }

  return (
    <main className="fixed inset-0 bg-gradient-to-b from-indigo-100 via-purple-50 to-pink-100 overflow-hidden">
      {/* Background blurs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-pink-200/40 rounded-full blur-3xl" />
      </div>

      {/* Floating sparkles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-400/40 text-sm"
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 20}%`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        >
          ✦
        </motion.div>
      ))}

      {/* Content - centered */}
      <div className="absolute inset-0 flex items-center justify-center">
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
