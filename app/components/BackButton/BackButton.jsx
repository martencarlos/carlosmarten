'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import styles from "./backbutton.module.css";

export default function BackButton() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const handleBack = () => {
    router.back();
  };

  return (
    <button 
      onClick={handleBack} 
      className={`${styles.backButton} ${resolvedTheme === 'dark' ? styles.darkMode : styles.lightMode}`}
    >
      &larr; Back
    </button>
  );
}