// SkeletonLoader.js
"use client";
import styles from "./SkeletonLoader.module.css"; // Adjust the path as needed
import { useTheme } from "next-themes";

const SkeletonLoader = () => {
  console.log("SkeletonLoader loaded");
  const { resolvedTheme } = useTheme();
  return (
    <div
      className={`${styles.skeletonContainer} ${
        resolvedTheme === "dark" ? styles.darkMode : styles.lightMode
      }`}
    ></div>
  );
};

export default SkeletonLoader;
