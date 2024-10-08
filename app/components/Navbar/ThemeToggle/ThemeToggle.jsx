"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import styles from "./themetoggle.module.css";

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`${styles.themeToggle} ${theme === "dark" ? styles.dark : ""}`}
    >
      {theme === "dark" ? <Sun size={20} aria-label="sun" /> : <Moon size={20} aria-label="moon"/>}
    </button>
  );
};

export default ThemeToggle;
