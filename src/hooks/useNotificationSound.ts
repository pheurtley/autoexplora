"use client";

import { useCallback, useRef, useEffect } from "react";

// Simple notification sound using Web Audio API
const createNotificationSound = () => {
  if (typeof window === "undefined") return null;

  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return audioContext;
  } catch {
    return null;
  }
};

export function useNotificationSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isEnabledRef = useRef(true);

  useEffect(() => {
    // Check localStorage for sound preference
    const savedPref = localStorage.getItem("chatSoundEnabled");
    isEnabledRef.current = savedPref !== "false";
  }, []);

  const playMessageSound = useCallback(() => {
    if (!isEnabledRef.current) return;

    try {
      // Create audio context on first interaction
      if (!audioContextRef.current) {
        audioContextRef.current = createNotificationSound();
      }

      const ctx = audioContextRef.current;
      if (!ctx) return;

      // Resume audio context if suspended (browser autoplay policy)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create a pleasant notification sound
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Use a soft, pleasant frequency
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      oscillator.type = "sine";

      // Quick fade in and out for a gentle "ding"
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      // Silently fail - audio is not critical
      console.debug("Could not play notification sound:", error);
    }
  }, []);

  const playSentSound = useCallback(() => {
    if (!isEnabledRef.current) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = createNotificationSound();
      }

      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Softer "whoosh" for sent messages
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.1);
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (error) {
      console.debug("Could not play sent sound:", error);
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    isEnabledRef.current = enabled;
    localStorage.setItem("chatSoundEnabled", String(enabled));
  }, []);

  const isEnabled = useCallback(() => {
    return isEnabledRef.current;
  }, []);

  return {
    playMessageSound,
    playSentSound,
    setEnabled,
    isEnabled,
  };
}
