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
      <div className={styles.blogHeader}> 
        <h1 className={styles.blogTitle}>Latest Posts</h1>
        <p className={styles.blogDescription}>
          Welcome to the blog! Here you will find the latest posts.
        </p>
      </div>
      <SearchBar onSearch={setSearchQuery} />
      <CategoryList
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
      />
      
      <PostList selectedCategory={selectedCategory} searchQuery={searchQuery} />
    </div>
  );
}
