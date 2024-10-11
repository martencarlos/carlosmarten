"use client";


import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import styles from "./themetoggle.module.css";

const ThemeToggle = () => {
  console.log("ThemeToggle loaded");
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`${styles.themeToggle} ${theme === "dark" ? styles.dark : ""}`}
    >
      {theme === "dark" ? (
        <Sun size={20} aria-label="sun" />
      ) : (
        <Moon size={20} aria-label="moon" />
      )}
    </button>
  );
};

export default ThemeToggle;
