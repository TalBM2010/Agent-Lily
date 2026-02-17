"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MAX_RECORDING_SECONDS } from "@/lib/constants";

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

  // Create audio element on mount - using HTML5 Audio can help with iOS silent mode
  useEffect(() => {
    const audio = new Audio();
    // @ts-expect-error - playsInline exists on iOS Safari
    audio.playsInline = true;
    // @ts-expect-error - webkit property for iOS
    audio.webkitPlaysInline = true;
    audioElementRef.current = audio;
    
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

  const unlockAudio = useCallback(() => {
    // Play a silent/tiny sound to unlock audio on iOS
    const audio = audioElementRef.current;
    if (audio) {
      // Tiny silent MP3 data URL
      audio.src = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAgAAAbAAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAbD/////////";
      audio.volume = 0.01;
      audio.play().catch(() => {});
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

    const audio = audioElementRef.current;
    if (!audio) return;

    // Stop any current playback
    audio.pause();
    audio.currentTime = 0;

    // Set the source as a data URL
    audio.src = `data:audio/mp3;base64,${base64}`;
    audio.volume = 1.0;
    
    setIsPlaying(true);
    
    audio.onended = () => {
      setIsPlaying(false);
    };
    
    audio.onerror = () => {
      console.error("Audio playback failed");
      setIsPlaying(false);
    };

    audio.play().catch((err) => {
      console.error("Audio play failed:", err);
      setIsPlaying(false);
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
