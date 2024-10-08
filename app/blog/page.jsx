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

      <PostList selectedCategory={selectedCategory} searchQuery={searchQuery} />
    </div>
  );
}
