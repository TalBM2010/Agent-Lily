"use client";

import { useState, useCallback } from "react";
import type { AvatarState } from "@/lib/types";

type UseAvatarReturn = {
  state: AvatarState;
  setIdle: () => void;
  setListening: () => void;
  setThinking: () => void;
  setSpeaking: () => void;
};

export function useAvatar(): UseAvatarReturn {
  const [state, setState] = useState<AvatarState>("idle");

  const setIdle = useCallback(() => setState("idle"), []);
  const setListening = useCallback(() => setState("listening"), []);
  const setThinking = useCallback(() => setState("thinking"), []);
  const setSpeaking = useCallback(() => setState("speaking"), []);

  return { state, setIdle, setListening, setThinking, setSpeaking };
}
