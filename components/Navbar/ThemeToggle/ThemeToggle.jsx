"use client";

import { useTheme } from "next-themes";
// import { Sun, Moon } from "lucide-react";
import { FaSun, FaMoon } from "react-icons/fa";
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
        <FaSun size={20} aria-label="sun" />
      ) : (
        <FaMoon size={20} aria-label="moon" />
      )}
    </button>
  );
};

export default ThemeToggle;
