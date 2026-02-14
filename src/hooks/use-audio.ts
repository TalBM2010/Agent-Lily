"use client";

import { useState, useRef, useCallback } from "react";
import { MAX_RECORDING_SECONDS } from "@/lib/constants";
import { createAudioDataUrl } from "@/lib/audio";

type UseAudioReturn = {
  isRecording: boolean;
  hasPermission: boolean | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  playAudio: (base64: string) => void;
  isPlaying: boolean;
  unlockAudio: () => void;
};

export function useAudio(): UseAudioReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const unlockAudio = useCallback(() => {
    // Create a reusable audio element and "warm it up" with a silent play
    // so the browser marks it as user-gesture-initiated
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });

      chunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after max duration
      timerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, MAX_RECORDING_SECONDS * 1000);
    } catch {
      setHasPermission(false);
      setError("Could not access microphone. Please allow microphone access!");
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder || mediaRecorder.state !== "recording") {
      return null;
    }

    return new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        // Stop all tracks to release the mic
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        resolve(blob);
      };
      mediaRecorder.stop();
    });
  }, []);

  const playAudio = useCallback((base64: string) => {
    setError(null);

    // Stop any current playback
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }

    const audio = new Audio(createAudioDataUrl(base64));
    audioElementRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => {
      setIsPlaying(false);
      setError("Could not play audio");
    };

    audio.play().catch((err) => {
      console.error("Audio playback failed:", err);
      setIsPlaying(false);
      setError("Could not play audio");
    });
  }, []);

  return {
    isRecording,
    hasPermission,
    error,
    startRecording,
    stopRecording,
    playAudio,
    isPlaying,
    unlockAudio,
  };
}
