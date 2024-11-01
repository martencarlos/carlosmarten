"use client";

import { useState, useRef } from "react";
import { FaHeadphonesSimple } from "react-icons/fa6";
import styles from "./CustomAudioPlayer.module.css";

export default function CustomAudioPlayer({ audioUrl }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  if (!audioUrl) return null;

  return (
    <div className={styles.playerWrapper} onClick={togglePlay}>
      {/*<HiOutlineHeadphones className={styles.icon} />*/}
      <FaHeadphonesSimple />
      <span className={styles.text}>
        {isPlaying ? "Listening" : "Listen to the article"}
      </span>
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleEnded}
        className={styles.audioElement}
      />
    </div>
  );
}
