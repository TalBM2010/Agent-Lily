"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
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
    <main className="flex flex-col items-center justify-center px-4 py-16 min-h-screen">
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
    </main>
  );
}
