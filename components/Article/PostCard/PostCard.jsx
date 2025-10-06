// components/Article/PostCard/PostCard.jsx
"use client";

import Link from "next/link";
import styles from "./postcard.module.css";
import { useTheme } from "next-themes";
import Image from "next/image";
import OptimizedImage from "@components/OptimizedImage/OptimizedImage";

export default function PostCard({ post }) {
  console.log("Post Card loaded");
  const { resolvedTheme } = useTheme();

  const createDate = new Date(post.date).toLocaleDateString();

  const categories =
    post._embedded?.["wp:term"]?.[0]?.map((category) => category.name) || [];

  const featuredMediaLink =
    post._embedded?.["wp:featuredmedia"]?.[0]?.link || "";

  return (
    <div
      className={`${styles.card} ${
        resolvedTheme === "dark" ? styles.dark : ""
      }`}
    >
      {post._embedded && featuredMediaLink && (
        <div className={styles.card_image_wrapper}>
          <OptimizedImage
            src={featuredMediaLink}
            alt={post.title.rendered}
            fill
            priority
            className={styles.card_image}
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
      <div className={styles.card_info}>
        <Link href={`/posts/${post.slug}`}>
          <h2 className={styles.card_title}>{post.title.rendered}</h2>
        </Link>
        <p
          className={styles.card_excerpt}
          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
        ></p>
        <div className={styles.card_taxonomies}>
          <div className={styles.card_categories}>
            {categories.map((category) => (
              <Link key={category} href={`/categories/${category}`}>
                <span key={category} className={styles.card_tag}>
                  {category}
                </span>
              </Link>
            ))}
          </div>
          <div className={styles.card_meta}>
            {/*<p className={styles.card_author}>By {author}</p>*/}
            <p className={styles.card_date} suppressHydrationWarning>
              Created on {createDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}