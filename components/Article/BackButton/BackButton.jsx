"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import styles from "./backbutton.module.css";

export default function BackButton() {
  console.log("BackButton loaded");
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/blog");
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`${styles.backButton} ${
        resolvedTheme === "dark" ? styles.darkMode : styles.lightMode
      }`}
    >
      &larr; Back
    </button>
  );
}
