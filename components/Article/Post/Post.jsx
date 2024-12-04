"use client";

import styles from "./post.module.css";
import Image from "next/image";
import Link from "next/link";
import { FaClock, FaUser, FaCalendar, FaChevronUp } from "react-icons/fa";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import AudioPlayer from "@components/Article/AudioPlayer/AudioPlayer";

function calculateReadingTime(text) {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export default function Post({ post, audioUrl }) {
  const { resolvedTheme } = useTheme();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [time, setTime] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Initial skeleton loading state
  if (!mounted) {
    return (
      <div className={styles.container}>
        <article className={styles.article}></article>
      </div>
    );
  }

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
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={75}
                priority={true}
                className={styles.featuredImage}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx0fHRsdHSIeHx8dIigjJCUmJSQkIistLjIyLS4rNTs7OjU+QUJBQkFCQUFBQUFBQUH/2wBDABUXFx4ZHiMeHiNBLSUtQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUH/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                style={{ objectFit: "cover" }}
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
            <div className={styles.categories}>
              <span className={styles.categoryname}>Categories</span>
              <div className={styles.pillContainer}>
                {post.categories.map((category, index) => (
                  <Link
                    key={index}
                    href={`/categories/${category}`}
                    className={styles.categoryLink}
                  >
                    <span className={styles.pill}>{category}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className={styles.authorDateInfo}>
              <div className={styles.authorInfo}>
                <span className={styles.metaLabel}>
                  <FaUser aria-hidden="true" className={styles.icon} />
                  {post.author}
                </span>
              </div>
              <div className={styles.timeInfo}>
                <span className={styles.metaLabel}>
                  <FaClock aria-hidden="true" className={styles.icon} />
                  {time} min read
                </span>
              </div>
              <div className={styles.dateInfo}>
                <span className={styles.metaLabel}>
                  <FaCalendar aria-hidden="true" className={styles.icon} />
                  {post.last_modified.toLocaleDateString("es-ES")}
                </span>
              </div>
            </div>

            {post.pinned && <p className={styles.pinnedPost}>Pinned Post</p>}
          </div>

          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <button
            className={styles.scrollToTopButton}
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <FaChevronUp aria-hidden="true" />
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
