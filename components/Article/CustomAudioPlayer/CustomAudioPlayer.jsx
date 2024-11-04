"use client";

import { useState, useRef, useEffect } from "react";
import {
  FaHeadphones,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaEllipsisV,
  FaTimes,
} from "react-icons/fa";
import styles from "./CustomAudioPlayer.module.css";

// Custom hook for managing audio state
const useAudioState = (audioUrl) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      localStorage.setItem(
        "audioPlayerState",
        JSON.stringify({
          audioUrl,
          currentTime: audioRef.current?.currentTime || 0,
          isPlaying,
        })
      );
    }
  }, [isPlaying, audioUrl]);

  useEffect(() => {
    const savedState = localStorage.getItem("audioPlayerState");
    if (savedState) {
      const {
        audioUrl: savedUrl,
        currentTime: savedTime,
        isPlaying: savedIsPlaying,
      } = JSON.parse(savedState);
      if (savedUrl === audioUrl && audioRef.current) {
        audioRef.current.currentTime = savedTime;
        if (savedIsPlaying) {
          audioRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      }
    }
  }, [audioUrl]);

  return {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    showOptions,
    setShowOptions,
    audioRef,
  };
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const AudioPlayer = ({ audioUrl }) => {
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    showOptions,
    setShowOptions,
    audioRef,
  } = useAudioState(audioUrl);

  const togglePlay = () => {
    if (!isPlayerVisible) {
      setIsPlayerVisible(true);
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const newTime = (e.target.value / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // const handleVolumeChange = (e) => {
  //   const newVolume = parseFloat(e.target.value);
  //   setVolume(newVolume);
  //   if (audioRef.current) {
  //     audioRef.current.volume = newVolume;
  //   }
  //   setIsMuted(newVolume === 0);
  // };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const closePlayer = () => {
    setIsPlayerVisible(false);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  if (!audioUrl) return null;

  return (
    <div>
      <div className={styles.initialButton} onClick={togglePlay}>
        <FaHeadphones className={styles.icon} />
        <span className={styles.text}>
          {isPlaying ? "Listening" : "Listen to the article"}
        </span>
      </div>

      {isPlayerVisible && (
        <div className={styles.playerCard}>
          <div className={styles.playerContent}>
            <div className={styles.controls}>
              <div className={styles.mainControls}>
                <button onClick={togglePlay} className={styles.playButton}>
                  {isPlaying ? (
                    <FaPause className={styles.icon} />
                  ) : (
                    <FaPlay className={styles.icon} />
                  )}
                </button>
                <div className={styles.time}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className={styles.secondaryControls}>
                <button onClick={toggleMute} className={styles.iconButton}>
                  {isMuted ? (
                    <FaVolumeMute className={styles.icon} />
                  ) : (
                    <FaVolumeUp className={styles.icon} />
                  )}
                </button>

                <div className={styles.optionsWrapper}>
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className={styles.iconButton}
                  >
                    <FaEllipsisV className={styles.icon} />
                  </button>
                  {showOptions && (
                    <div className={styles.optionsMenu}>
                      <button className={styles.optionItem}>
                        Playback Speed: 1x
                      </button>
                      <button className={styles.optionItem}>
                        Download Audio
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
                value={(currentTime / duration) * 100 || 0}
                onChange={handleSeek}
                className={styles.progressSlider}
              />

              {/*              <input
                type="range"
                value={isMuted ? 0 : volume}
                min="0"
                max="1"
                step="0.1"
                onChange={handleVolumeChange}
                className={styles.volumeSlider}
              />*/}
            </div>
          </div>

          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
