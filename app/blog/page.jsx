"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import PostList from "../components/PostList/PostList";
import CategoryList from "../components/CategoryList/CategoryList";
import SearchBar from "../components/SearchBar/SearchBar";

async function getPosts() {
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
  const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/posts?_embed`, {
    next: { revalidate: 60 },
  });
  return res.json();
}

export default function Blog() {
  console.log("Blog page loaded");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      const fetchedPosts = await getPosts();
      setPosts(fetchedPosts);
      // setLoading(false); // Set loading to false after posts are fetched
    }
    fetchPosts();
  }, []);

  return (
    <div className={styles.blogMain}>
      <div className={styles.blogHeader}>
        <h1 className={styles.blogTitle}>Welcome to My Blog</h1>
        <p className={styles.subTitle}>
          Insights on Technology, Consulting, and Digital Transformation.
        </p>
        <p className={styles.blogDescription}>
          Explore in-depth articles on the latest in IT consulting, cutting-edge
          technologies, and digital strategies that drive business success. From
          Salesforce CRM solutions to operations and management insights, this
          blog offers practical tips, expert analysis, and the latest trends
          shaping the future of the industry.
        </p>
      </div>
      <SearchBar onSearch={setSearchQuery} />
      <CategoryList
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
      />

      <PostList
        posts={posts}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
      />
    </div>
  );
}
