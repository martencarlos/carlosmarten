"use client";

import { createContext, useContext, useState } from "react";

const AudioContext = createContext();

export function AudioProvider({ children }) {
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    isPlayerVisible: false,
    audioUrl: null,
    currentTime: 0,
  });

  const startPlaying = (url) => {
    setAudioState((prev) => ({
      ...prev,
      isPlaying: true,
      isPlayerVisible: true,
      audioUrl: url,
    }));
  };

  const stopPlaying = () => {
    setAudioState((prev) => ({
      ...prev,
      isPlaying: false,
    }));
  };

  const closePlayer = () => {
    setAudioState((prev) => ({
      ...prev,
      isPlaying: false,
      isPlayerVisible: false,
    }));
  };

  const updateCurrentTime = (time) => {
    setAudioState((prev) => ({
      ...prev,
      currentTime: time,
    }));
  };

  return (
    <AudioContext.Provider
      value={{
        audioState,
        startPlaying,
        stopPlaying,
        closePlayer,
        updateCurrentTime,
        setAudioState,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
