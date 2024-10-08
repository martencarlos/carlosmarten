// app/posts/[slug]/page.js
"use client";

import styles from "./post.module.css";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function calculateReadingTime(text) {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
  return readingTimeMinutes;
}

export default function Post({ post }) {
  const { theme, resolvedTheme } = useTheme();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  let time = calculateReadingTime(post.content);

  // Avoid rendering content until mounted to prevent hydration mismatch
  // if (!mounted) {
  //   return null;
  // }

  try {
    return (
      <div
        className={`${styles.container} ${
          resolvedTheme === "dark" ? styles.dark : ""
        }`}
      >
        <div
          className={styles.progressBar}
          style={{ width: `${scrollProgress}%` }}
        ></div>
        <article className={styles.article}>
          {post.featuredImage && (
            <div className={styles.featuredImageContainer}>
              <Image
                src={post.featuredImage}
                alt={post.title}
                layout="fill"
                objectFit="cover"
                className={styles.featuredImage}
              />
            </div>
          )}
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.postMeta}>
            <div className={styles.authorDateInfo}>
              <div className={styles.authorInfo}>
                <span className={styles.metaLabel}>Author:</span>
                <span className={styles.metaValue}>{post.author}</span>
              </div>
              <div className={styles.authorInfo}>
                <span className={styles.metaLabel}>Reading time:</span>
                <span className={styles.metaValue}>{time} minutes</span>
              </div>
              <div className={styles.dateInfo}>
                <div>
                  <span className={styles.metaLabel}>Last Modified:</span>
                  <span className={styles.metaValue}>
                    {post.last_modified.toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.categories}>
              <span className={styles.metaLabel}>Categories:</span>
              <div className={styles.pillContainer}>
                {post.categories.map((category, index) => (
                  <Link key={index} href={`/categories/${category}`}>
                    <span className={styles.pill}>{category}</span>
                  </Link>
                ))}
              </div>
            </div>
            {post.pinned && <p className={styles.pinnedPost}>Pinned Post</p>}
          </div>
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
        <button className={styles.scrollToTopButton} onClick={scrollToTop}>
          ↑
        </button>
      </div>
    );
  } catch (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Error</h1>
          <p>Failed to load the blog post. Please try again later.</p>
        </div>
      </div>
    );
  }
}
