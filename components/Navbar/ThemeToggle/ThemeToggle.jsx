"use client";

import { useTheme } from "next-themes";
import { FaSun, FaMoon } from "react-icons/fa";
import styles from "./themetoggle.module.css";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted
  if (!mounted) {
    return (
      <button className={styles.themeToggle}>
        <FaMoon size={20} aria-hidden="true" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={`${styles.themeToggle} ${
        resolvedTheme === "dark" ? styles.dark : ""
      }`}
      aria-label={`Switch to ${
        resolvedTheme === "dark" ? "light" : "dark"
      } mode`}
    >
      {resolvedTheme === "dark" ? (
        <FaSun size={20} aria-hidden="true" />
      ) : (
        <FaMoon size={20} aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle;
