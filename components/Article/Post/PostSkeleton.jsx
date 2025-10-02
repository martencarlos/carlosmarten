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
      className={`${styles.container} ${
        resolvedTheme === "dark" ? styles.dark : ""
      }`}
    >
      <article className={styles.article}>
        {/* Featured Image Skeleton */}
        <div className={styles.featuredImageSkeleton}></div>

        {/* Title Skeleton */}
        <div className={styles.titleSkeleton}></div>

        {/* Meta Info Skeleton */}
        <div className={styles.metaSkeleton}>
          {/* Categories Skeleton */}
          <div className={styles.categoriesSkeleton}>
            <div className={styles.pillSkeleton}></div>
            <div className={styles.pillSkeleton}></div>
            <div className={styles.pillSkeleton}></div>
          </div>

          {/* Author, Date, Time Info Skeleton */}
          <div className={styles.metaInfoRow}>
            <div className={styles.metaItem}></div>
            <div className={styles.metaItem}></div>
            <div className={styles.metaItem}></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className={styles.contentSkeleton}>
          <div className={styles.contentLine}></div>
          <div className={styles.contentLine}></div>
          <div className={styles.contentLine}></div>
          <div className={styles.contentLine}></div>
          <div className={styles.contentLine}></div>
          <div className={styles.contentLine}></div>
          <div className={styles.contentLine}></div>
          <div className={styles.contentLine}></div>
          <div className={styles.contentLine}></div>
          <div className={styles.contentLine}></div>
        </div>
      </article>
    </div>
  );
}