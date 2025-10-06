// components/Article/AudioPlayer/AudioPlayer.jsx
"use client";

import { FaHeadphones } from "react-icons/fa";
import { useAudio } from "@context/AudioContext";
import styles from "./AudioPlayer.module.css";

const AudioPlayer = ({ audioUrl }) => {
  const { audioState, startPlaying, stopPlaying } = useAudio();

  const isThisAudioPlaying =
    audioState.isPlaying && audioState.audioUrl === audioUrl;

  const togglePlay = () => {
    if (audioState.audioUrl !== audioUrl) {
      startPlaying(audioUrl);
    } else if (isThisAudioPlaying) {
      stopPlaying();
    } else {
      startPlaying(audioUrl);
    }
  };

  if (!audioUrl) return null;

  return (
    <div 
      className={styles.initialButton} 
      onClick={togglePlay}
      title={isThisAudioPlaying ? "Listening" : "Listen to the article"}
      aria-label={isThisAudioPlaying ? "Listening" : "Listen to the article"}
    >
      <FaHeadphones className={styles.iconOnly} />
    </div>
  );
};

export default AudioPlayer;