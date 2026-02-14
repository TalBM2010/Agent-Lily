"use client";

import { useState, useRef, useCallback } from "react";
import { MAX_RECORDING_SECONDS } from "@/lib/constants";

type UseAudioReturn = {
  isRecording: boolean;
  hasPermission: boolean | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  playAudio: (base64: string) => Promise<void>;
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const unlockAudio = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    // Play a silent buffer to fully unlock audio on iOS Safari
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  }, [getAudioContext]);

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

  const playAudio = useCallback(async (base64: string): Promise<void> => {
    setError(null);

    // Stop any current playback
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch {
        // Already stopped
      }
    }

    const ctx = getAudioContext();

    try {
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const audioBuffer = await ctx.decodeAudioData(
        bytes.buffer.slice(0) as ArrayBuffer
      );

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      sourceNodeRef.current = source;

      setIsPlaying(true);
      source.onended = () => {
        setIsPlaying(false);
        sourceNodeRef.current = null;
      };
      source.start(0);
    } catch (err) {
      console.error("Audio playback failed:", err);
      setIsPlaying(false);
      setError("Audio playback failed");
      throw err;
    }
  }, [getAudioContext]);

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
