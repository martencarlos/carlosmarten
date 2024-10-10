"use client";

import Link from "next/link";
import styles from "./postcard.module.css";
import { useTheme } from "next-themes";

export default function PostCard({ post }) {
  console.log("Post Card loaded");
  const { resolvedTheme } = useTheme();

  const createDate = new Date(post.date).toLocaleDateString();
  // const lastModified = new Date(post.modified).toLocaleDateString();

  const categories =
    post._embedded?.["wp:term"]?.[0]?.map((category) => category.name) || [];

  // const tags = post._embedded["wp:term"]
  //   .flat()
  //   .filter((term) => term.taxonomy === "post_tag")
  //   .map((tag) => tag.name);

  // const author = post._embedded["author"][0].name;

  return (
    <div
      className={`${styles.card} ${
        resolvedTheme === "dark" ? styles.dark : ""
      }`}
    >
      <Link href={`/posts/${post.slug}`}>
        <h2 className={styles.card_title}>{post.title.rendered}</h2>
      </Link>
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
        {/* Uncomment if you want to display tags
          <div className={styles.card_tags}>
            {tags.map(tag => (
              <span key={tag} className={styles.card_tag}>{tag}</span>
            ))}
          </div>
          */}
      </div>
      <div className={styles.card_meta}>
        {/*<p className={styles.card_author}>By {author}</p>*/}
        <p className={styles.card_date} suppressHydrationWarning >Created: {createDate}</p>
        {/* Uncomment if you want to display last modified date
          <p className={styles.card_date}>Last modified: {lastModified}</p>
          */}
      </div>
    </div>
  );
}
