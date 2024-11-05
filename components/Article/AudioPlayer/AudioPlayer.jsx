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
    <div className={styles.initialButton} onClick={togglePlay}>
      <FaHeadphones className={styles.icon} />
      <span className={styles.text}>
        {isThisAudioPlaying ? "Listening" : "Listen to the article"}
      </span>
    </div>
  );
};

export default AudioPlayer;
