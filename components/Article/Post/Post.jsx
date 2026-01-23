// components/Article/Post/Post.jsx
'use client';

import styles from './post.module.css';

import Link from 'next/link';
import { FaClock, FaUser, FaCalendar, FaChevronUp, FaEye } from 'react-icons/fa';
import { ArrowLeft } from 'lucide-react'; // Import Lucide icon
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import OptimizedImage from '@components/OptimizedImage/OptimizedImage';
import AudioPlayer from '@components/Article/AudioPlayer/AudioPlayer';
import { incrementView } from '@actions/viewCounter';

function calculateReadingTime(text) {
  if (!text) return 0;
  const wordsPerMinute = 200;
  // Strip HTML tags for accurate word count
  const plainText = text.replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Helper function to decode HTML entities
function decodeHTMLEntities(text) {
  if (typeof window === 'undefined') return text;
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

export default function Post({ post, initialViews = 0, slug }) {
  const { resolvedTheme } = useTheme();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [time, setTime] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [decodedTitle, setDecodedTitle] = useState(post.title);
  const [viewCount, setViewCount] = useState(initialViews);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle view increment
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        if (slug) {
          await incrementView(slug);
          setViewCount(prev => parseInt(prev) + 1);
        }
      } catch (err) {
        console.error("Failed to increment view count", err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [slug]);

  // Handle mounting and scroll effects
  useEffect(() => {
    window.scrollTo(0, 0);
    setMounted(true);
    setDecodedTitle(decodeHTMLEntities(post.title));

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);

    // Calculate reading time
    if (post.content) {
      const time = calculateReadingTime(post.content);
      setTime(time);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [post.title, post.content]);

  // Initial skeleton loading state
  if (!mounted) {
    return (
      <div className={styles.container}>
        <article className={styles.article} style={{ height: '100vh' }} />
      </div>
    );
  }

  try {
    return (
      <div className={`${styles.container} ${resolvedTheme === 'dark' ? styles.dark : ''}`}>
        <div
          className={styles.progressBar}
          style={{ width: `${scrollProgress}%` }}
        />

        <article className={styles.article}>
          {post.featuredImage && (
            <div className={styles.featuredImageContainer}>
              <OptimizedImage
                src={post.featuredImage}
                alt={decodedTitle}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 800px"
                quality={85}
                priority={true}
                className={styles.featuredImage}
                style={{ objectFit: 'cover' }}
              />
              <div className={styles.backButtonOverlay}>
                <Link href="/blog">
                  <button
                    className={styles.overlayBackButton}
                    aria-label="Go back to blog"
                  >
                    <ArrowLeft size={18} strokeWidth={2.5} />
                    <span>Back</span>
                  </button>
                </Link>
              </div>
            </div>
          )}

          <div className={styles.titleContainer}>
            <h1 className={styles.title}>{decodedTitle}</h1>
            {post.audioUrl && (
              <div className={styles.audioPlayerIcon}>
                <AudioPlayer audioUrl={post.audioUrl} />
              </div>
            )}
          </div>

          <div className={styles.postMeta}>
            <div className={styles.categories}>
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
              <span className={styles.metaLabel}>
                <FaUser aria-hidden="true" className={styles.icon} />
                {post.author}
              </span>

              <span className={styles.metaLabel}>
                <FaEye aria-hidden="true" className={styles.icon} />
                {viewCount} views
              </span>

              <span className={styles.metaLabel}>
                <FaClock aria-hidden="true" className={styles.icon} />
                {time} min read
              </span>

              <span className={styles.metaLabel}>
                <FaCalendar aria-hidden="true" className={styles.icon} />
                {post.create_date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <button
            className={styles.scrollToTopButton}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            style={{ display: showScrollTop ? 'flex' : 'none' }}
          >
            <FaChevronUp aria-hidden="true" />
          </button>
        </article>
      </div>
    );
  } catch (error) {
    console.error("Error rendering post:", error);
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h1>Error</h1>
          <p>Failed to load the blog post. Please refresh the page.</p>
        </div>
      </div>
    );
  }
}