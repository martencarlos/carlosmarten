// components/Article/Post/PostSkeleton.jsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import styles from "./PostSkeleton.module.css";

export default function PostSkeleton() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={styles.container}>
        <article className={styles.article}></article>
      </div>
    );
  }

  return (
    <div
      className={`${styles.container} ${resolvedTheme === "dark" ? styles.dark : ""
        }`}
    >
      {/* Animated gradient background overlay */}
      <div className={styles.backgroundGradient}></div>

      <article className={styles.article}>
        {/* Featured Image Skeleton with shimmer effect */}
        <div className={styles.featuredImageSkeleton}>
          <div className={styles.shimmerOverlay}></div>
          <div className={styles.pulseCircle}></div>
        </div>

        {/* Title Skeleton with staggered animation */}
        <div className={styles.titleSection}>
          <div className={`${styles.titleSkeleton} ${styles.animDelay1}`}></div>
          <div className={`${styles.titleSkeleton} ${styles.short} ${styles.animDelay2}`}></div>
        </div>

        {/* Meta Info Skeleton */}
        <div className={styles.metaSkeleton}>
          {/* Categories Skeleton */}
          <div className={styles.categoriesSkeleton}>
            <div className={`${styles.pillSkeleton} ${styles.animDelay1}`}></div>
            <div className={`${styles.pillSkeleton} ${styles.animDelay2}`}></div>
            <div className={`${styles.pillSkeleton} ${styles.animDelay3}`}></div>
          </div>

          {/* Author, Date, Time Info Skeleton */}
          <div className={styles.metaInfoRow}>
            <div className={`${styles.metaItem} ${styles.animDelay1}`}>
              <div className={styles.iconPlaceholder}></div>
              <div className={styles.textPlaceholder}></div>
            </div>
            <div className={`${styles.metaItem} ${styles.animDelay2}`}>
              <div className={styles.iconPlaceholder}></div>
              <div className={styles.textPlaceholder}></div>
            </div>
            <div className={`${styles.metaItem} ${styles.animDelay3}`}>
              <div className={styles.iconPlaceholder}></div>
              <div className={styles.textPlaceholder}></div>
            </div>
          </div>
        </div>

        {/* Content Skeleton with varying widths */}
        <div className={styles.contentSkeleton}>
          <div className={`${styles.contentLine} ${styles.full} ${styles.animDelay1}`}></div>
          <div className={`${styles.contentLine} ${styles.full} ${styles.animDelay2}`}></div>
          <div className={`${styles.contentLine} ${styles.medium} ${styles.animDelay3}`}></div>
          <div className={`${styles.contentLine} ${styles.full} ${styles.animDelay4}`}></div>
          <div className={`${styles.contentLine} ${styles.full} ${styles.animDelay5}`}></div>
          <div className={`${styles.contentLine} ${styles.short} ${styles.animDelay6}`}></div>
          <div className={`${styles.contentLine} ${styles.full} ${styles.animDelay1}`}></div>
          <div className={`${styles.contentLine} ${styles.medium} ${styles.animDelay2}`}></div>
          <div className={`${styles.contentLine} ${styles.full} ${styles.animDelay3}`}></div>
          <div className={`${styles.contentLine} ${styles.full} ${styles.animDelay4}`}></div>
        </div>

        {/* Floating particles for visual interest */}
        <div className={styles.particles}>
          <div className={`${styles.particle} ${styles.particle1}`}></div>
          <div className={`${styles.particle} ${styles.particle2}`}></div>
          <div className={`${styles.particle} ${styles.particle3}`}></div>
          <div className={`${styles.particle} ${styles.particle4}`}></div>
          <div className={`${styles.particle} ${styles.particle5}`}></div>
        </div>
      </article>

      {/* Loading indicator at the bottom */}
      <div className={styles.loadingIndicator}>
        <div className={styles.loadingBar}></div>
        <div className={styles.loadingDots}>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
      </div>
    </div>
  );
}