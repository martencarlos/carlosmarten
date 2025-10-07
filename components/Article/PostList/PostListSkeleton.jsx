// Path: components/Article/PostList/PostListSkeleton.jsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import styles from "./PostListSkeleton.module.css";

export default function PostListSkeleton({ count = 6 }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={styles.container}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={styles.skeletonCard}></div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${styles.container} ${
        resolvedTheme === "dark" ? styles.dark : ""
      }`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          {/* Image skeleton */}
          <div className={styles.imageSkeleton}></div>

          {/* Content skeleton */}
          <div className={styles.contentSkeleton}>
            {/* Title skeleton */}
            <div className={styles.titleSkeleton}>
              <div className={styles.titleLine}></div>
              <div className={styles.titleLine} style={{ width: "80%" }}></div>
            </div>

            {/* Excerpt skeleton */}
            <div className={styles.excerptSkeleton}>
              <div className={styles.excerptLine}></div>
              <div className={styles.excerptLine} style={{ width: "90%" }}></div>
            </div>

            {/* Footer skeleton */}
            <div className={styles.footerSkeleton}>
              {/* Categories */}
              <div className={styles.categoriesSkeleton}>
                <div className={styles.categoryPill}></div>
                <div className={styles.categoryPill}></div>
              </div>

              {/* Date */}
              <div className={styles.dateSkeleton}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}