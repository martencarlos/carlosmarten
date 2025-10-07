// Path: components/Article/PostCard/PostCard.jsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./postcard.module.css";
import { useTheme } from "next-themes";
import OptimizedImage from "@components/OptimizedImage/OptimizedImage";
import { useEffect, useState, useTransition } from "react";

// Helper function to decode HTML entities
function decodeHTMLEntities(text) {
  if (typeof window === 'undefined') return text;
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

export default function PostCard({ post }) {
  console.log("Post Card loaded");
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [decodedTitle, setDecodedTitle] = useState(post.title.rendered);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    setDecodedTitle(decodeHTMLEntities(post.title.rendered));
  }, [post.title.rendered]);

  const createDate = new Date(post.date).toLocaleDateString();

  const categories =
    post._embedded?.["wp:term"]?.[0]?.map((category) => category.name) || [];

  const featuredMediaLink =
    post._embedded?.["wp:featuredmedia"]?.[0]?.link || "";

  // Show original title during SSR to avoid hydration mismatch
  const displayTitle = mounted ? decodedTitle : post.title.rendered;

  // Handle click with transition for immediate feedback
  const handleClick = (e) => {
    e.preventDefault();
    startTransition(() => {
      router.push(`/posts/${post.slug}`);
    });
  };

  return (
    <div
      className={`${styles.card} ${
        resolvedTheme === "dark" ? styles.dark : ""
      } ${isPending ? styles.loading : ""}`}
    >
      {post._embedded && featuredMediaLink && (
        <div className={styles.card_image_wrapper}>
          <OptimizedImage
            src={featuredMediaLink}
            alt={displayTitle}
            fill
            priority
            className={styles.card_image}
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
      <div className={styles.card_info}>
        <Link href={`/posts/${post.slug}`} onClick={handleClick}>
          <h2 className={styles.card_title}>{displayTitle}</h2>
        </Link>
        <p
          className={styles.card_excerpt}
          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
        ></p>
        <div className={styles.card_taxonomies}>
          <div className={styles.card_categories}>
            {categories.map((category) => (
              <Link key={category} href={`/categories/${category}`}>
                <span className={styles.card_tag}>
                  {category}
                </span>
              </Link>
            ))}
          </div>
          <div className={styles.card_meta}>
            <p className={styles.card_date} suppressHydrationWarning>
              Created on {createDate}
            </p>
          </div>
        </div>
      </div>
      {isPending && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </div>
  );
}