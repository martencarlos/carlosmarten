"use client";
import { useState, useEffect } from "react";
import Card from "@components/(Post)/PostCard/PostCard";
import SkeletonLoader from "@components/(aux)/SkeletonLoader/SkeletonLoader";
import styles from "./postlist.module.css";

export default function PostList({ posts, selectedCategory, searchQuery }) {
  console.log("PostList loaded");
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    if (selectedCategory || searchQuery) {
      const filtered = posts.filter((post) => {
        const matchesCategory =
          !selectedCategory || post.categories.includes(selectedCategory);
        const matchesSearch =
          !searchQuery ||
          post.title.rendered.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
      setFilteredPosts(filtered);
    }
  }, [posts, selectedCategory, searchQuery]);

  // SHOW SKELETON if posts are not loaded. posts.length === 0
  if (!posts || posts.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonLoader key={index} />
        ))}
      </div>
    );
  }
  // SHOW ALL POSTS if there is no selected category or search query
  else if (!selectedCategory && !searchQuery) {
    return (
      <div className={styles.one_column} suppressHydrationWarning>
        <ul className={styles.ul}>
          {posts.map((post) => (
            <li className={styles.li} key={post.id}>
              <Card a post={post} />
            </li>
          ))}
        </ul>
      </div>
    );
  }
  // SHOW NO POSTS FOUND if there is a selected category or search query and no filtered posts are found
  else if (filteredPosts.length === 0) {
    return (
      <div className={styles.one_column}>
        <p className={styles.noPosts}>
          No posts found for the selected category or search query.
        </p>
      </div>
    );
  }
  // SHOW FILTERED POSTS if there is a selected category or search query and filtered posts are found
  else {
    return (
      <div className={styles.one_column}>
        <ul className={styles.ul}>
          {filteredPosts.map((post) => (
            <li className={styles.li} key={post.id}>
              <Card post={post} />
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
