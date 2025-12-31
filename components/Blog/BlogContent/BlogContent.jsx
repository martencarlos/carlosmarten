"use client";
import { useState } from "react";

import PostList from "components/Article/PostList/PostList";
import CategoryList from "components/Blog/CategoryList/CategoryList";
import SearchBar from "components/Blog/SearchBar/SearchBar";

export default function BlogContent({ posts, categories, viewCounts }) {
  console.log("Blog Content loaded");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <SearchBar onSearch={setSearchQuery} />
      <CategoryList
        categories={categories}
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
      />
      <PostList
        posts={posts}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        viewCounts={viewCounts}
      />
    </>
  );
}