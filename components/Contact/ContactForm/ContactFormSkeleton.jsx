// Path: components/Contact/ContactForm/ContactFormSkeleton.jsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import styles from "./ContactFormSkeleton.module.css";

export default function ContactFormSkeleton() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={styles.container}>
        <div className={styles.form}></div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.container} ${
        resolvedTheme === "dark" ? styles.dark : ""
      }`}
    >
      <div className={styles.form}>
        {/* Title skeleton */}
        <div className={styles.titleSkeleton}></div>

        {/* Row with two inputs */}
        <div className={styles.row}>
          <div className={styles.inputSkeleton}></div>
          <div className={styles.inputSkeleton}></div>
        </div>

        {/* Textarea skeleton */}
        <div className={styles.textareaSkeleton}></div>

        {/* Button skeleton */}
        <div className={styles.buttonSkeleton}></div>
      </div>
    </div>
  );
}