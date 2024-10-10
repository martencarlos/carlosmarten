"use client";
import { useState } from "react";

import PostList from "@components/PostList/PostList";
import CategoryList from "@components/CategoryList/CategoryList";
import SearchBar from "@components/SearchBar/SearchBar";

export default function Blog({ posts, categories }) {
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
      />
    </>
  );
}
