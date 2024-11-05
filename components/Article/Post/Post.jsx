// app/posts/[slug]/page.js
"use client";

import styles from "./post.module.css";
import Image from "next/image";
import Link from "next/link";
import { FaClock, FaUser, FaCalendar } from "react-icons/fa";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FaChevronUp } from "react-icons/fa6";
import AudioPlayer from "@components/Article/AudioPlayer/AudioPlayer";

function calculateReadingTime(text) {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
  return readingTimeMinutes;
}
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export default function Post({ post, audioUrl }) {
  console.log("Post loaded");
  const { resolvedTheme } = useTheme();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const time = calculateReadingTime(post.content);
    setTime(time);
  }, [post.content]);

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
          {audioUrl && (
            <div className={styles.audioPlayer}>
              <AudioPlayer audioUrl={audioUrl} />
            </div>
          )}

          <h1 className={styles.title}>{post.title}</h1>

          <div className={styles.postMeta}>
            <div className={styles.authorDateInfo}>
              <div className={styles.authorInfo}>
                <span className={styles.metaLabel}>
                  <FaUser style={{ marginRight: "5px" }} />
                  {post.author}
                </span>
              </div>
              <div className={styles.timeInfo}>
                <span className={styles.metaLabel}>
                  <FaClock style={{ marginRight: "5px" }} />
                  {time} min read
                </span>
              </div>

              <div className={styles.dateInfo}>
                <div>
                  <span className={styles.metaLabel}>
                    <FaCalendar style={{ marginRight: "5px" }} />
                    {post.last_modified.toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.categories}>
              <span className={styles.metaÇategories}>Categories:</span>
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
          <button className={styles.scrollToTopButton} onClick={scrollToTop}>
            <FaChevronUp />
          </button>
        </article>
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
