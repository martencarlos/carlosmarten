"use client";
import { createContext, useContext, useState } from "react";

const AudioContext = createContext();

export default function AudioProvider({ children }) {
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    isPlayerVisible: false,
    audioUrl: null,
  });

  const startPlaying = (url) => {
    setAudioState({
      isPlaying: true,
      isPlayerVisible: true,
      audioUrl: url,
    });
  };

  const stopPlaying = () => {
    setAudioState((prev) => ({
      ...prev,
      isPlaying: false,
    }));
  };

  const closePlayer = () => {
    setAudioState({
      isPlaying: false,
      isPlayerVisible: false,
      audioUrl: null,
    });
  };

  return (
    <AudioContext.Provider
      value={{
        audioState,
        startPlaying,
        stopPlaying,
        closePlayer,
      }}
    >
      {children}
      {audioState.audioUrl && (
        <AudioPlayer
          audioUrl={audioState.audioUrl}
          isGloballyPlaying={audioState.isPlaying}
          isVisible={audioState.isPlayerVisible}
          onClose={closePlayer}
          onPlayingChange={(playing) =>
            setAudioState((prev) => ({
              ...prev,
              isPlaying: playing,
            }))
          }
        />
      )}
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
