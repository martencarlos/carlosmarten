"use client";

import { useRef, useEffect, useState } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaEllipsisV,
  FaTimes,
} from "react-icons/fa";
import { MdFileDownload } from "react-icons/md";
import { useAudio } from "@context/AudioContext";
import styles from "./AudioPlayer.module.css";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2];

const GlobalAudioPlayer = () => {
  const {
    audioState,
    stopPlaying,
    closePlayer,
    updateCurrentTime,
    setAudioState,
  } = useAudio();
  const audioRef = useRef(null);
  const [currentSpeedIndex, setCurrentSpeedIndex] = useState(2); // Default 1x speed (index 2)

  useEffect(() => {
    if (audioRef.current) {
      if (audioState.isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [audioState.isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = audioState.currentTime;
    }
  }, [audioState.audioUrl]);

  const togglePlay = () => {
    setAudioState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      updateCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioState((prev) => ({
        ...prev,
        duration: audioRef.current.duration,
      }));
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const newTime = (e.target.value / 100) * audioState.duration;
      audioRef.current.currentTime = newTime;
      updateCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const isMuted = audioRef.current.volume === 0;
      audioRef.current.volume = isMuted ? 1 : 0;
      setAudioState((prev) => ({
        ...prev,
        isMuted: !isMuted,
      }));
    }
  };

  const changePlaybackSpeed = () => {
    if (audioRef.current) {
      const nextIndex = (currentSpeedIndex + 1) % PLAYBACK_SPEEDS.length;
      setCurrentSpeedIndex(nextIndex);
      audioRef.current.playbackRate = PLAYBACK_SPEEDS[nextIndex];
    }
  };

  const handleDownload = () => {
    // Create a temporary anchor element
    const anchor = document.createElement("a");
    anchor.href = audioState.audioUrl;

    // Extract filename from URL or use a default name
    const filename = audioState.audioUrl.split("/").pop() || "audio.mp3";
    anchor.download = filename;

    // Trigger download
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Close options menu after download starts
    setAudioState((prev) => ({ ...prev, showOptions: false }));
  };

  if (!audioState.isPlayerVisible) return null;

  return (
    <div className={styles.playerCard}>
      <div className={styles.playerContent}>
        <div className={styles.controls}>
          <div className={styles.mainControls}>
            <button onClick={togglePlay} className={styles.playButton}>
              {audioState.isPlaying ? (
                <FaPause className={styles.icon} />
              ) : (
                <FaPlay className={styles.icon} />
              )}
            </button>
            <div className={styles.time}>
              {formatTime(audioState.currentTime)} /{" "}
              {formatTime(audioState.duration || 0)}
            </div>
          </div>

          <div className={styles.secondaryControls}>
            <button onClick={toggleMute} className={styles.iconButton}>
              {audioState.isMuted ? (
                <FaVolumeMute className={styles.icon} />
              ) : (
                <FaVolumeUp className={styles.icon} />
              )}
            </button>

            <div className={styles.optionsWrapper}>
              <button
                onClick={() =>
                  setAudioState((prev) => ({
                    ...prev,
                    showOptions: !prev.showOptions,
                  }))
                }
                className={styles.iconButton}
              >
                <FaEllipsisV className={styles.icon} />
              </button>
              {audioState.showOptions && (
                <div className={styles.optionsMenu}>
                  <button
                    className={styles.optionItem}
                    onClick={changePlaybackSpeed}
                  >
                    <span>Playback Speed:</span>
                    <span className={styles.icon}>
                      {PLAYBACK_SPEEDS[currentSpeedIndex]}x
                    </span>
                  </button>
                  <button
                    className={styles.optionItem}
                    onClick={handleDownload}
                  >
                    <span>Download Audio </span>
                    <MdFileDownload className={styles.icon} />
                  </button>
                </div>
              )}
            </div>

            <button onClick={closePlayer} className={styles.iconButton}>
              <FaTimes className={styles.icon} />
            </button>
          </div>
        </div>

        <div className={styles.sliders}>
          <input
            type="range"
            value={
              (audioState.currentTime / (audioState.duration || 1)) * 100 || 0
            }
            onChange={handleSeek}
            className={styles.progressSlider}
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioState.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={stopPlaying}
      />
    </div>
  );
};

export default GlobalAudioPlayer;
