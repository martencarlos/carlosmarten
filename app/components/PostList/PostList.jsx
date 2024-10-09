"use client";
import { useState, useEffect } from "react";
import Card from "../Card/Card";
import SkeletonLoader from "../SkeletonLoader/SkeletonLoader"; // Adjust the path as needed
import styles from "./postlist.module.css";

async function getPosts() {
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
  const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/posts?_embed`, {
    next: { revalidate: 60 },
  });
  return res.json();
}

export default function PostList({ selectedCategory, searchQuery }) {
  console.log("PostList loaded");
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true); // New loading state

  useEffect(() => {
    async function fetchPosts() {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
      setLoading(false); // Set loading to false after posts are fetched
    }
    fetchPosts();
  }, []);

  useEffect(() => {
    const filtered = posts.filter((post) => {
      const matchesCategory =
        !selectedCategory || post.categories.includes(selectedCategory);
      const matchesSearch =
        !searchQuery ||
        post.title.rendered.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    setFilteredPosts(filtered);
  }, [posts, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonLoader key={index} />
        ))}
      </div>
    );
  }

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
