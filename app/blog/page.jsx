"use client";
import { useState } from "react";
import styles from "./page.module.css";
import PostList from "../components/PostList/PostList";
import CategoryList from "../components/CategoryList/CategoryList";
import SearchBar from "../components/SearchBar/SearchBar";

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className={styles.blogMain}>
      <h1 className={styles.blogTitle}>Latest Posts</h1>
      <p className={styles.blogDescription}>
        Welcome to the blog! Here you will find the latest posts.
      </p>
      <CategoryList onSelectCategory={setSelectedCategory} />
      <SearchBar onSearch={setSearchQuery} />
      <PostList selectedCategory={selectedCategory} searchQuery={searchQuery} />
    </div>
  );
}
