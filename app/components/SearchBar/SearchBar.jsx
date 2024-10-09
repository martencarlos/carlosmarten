"use client";
import { useState } from "react";
import styles from "./searchbar.module.css";

export default function SearchBar({ onSearch }) {
  console.log("SearchBar loaded");
  const [query, setQuery] = useState("");

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
  };

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="Search posts..."
        value={query}
        onChange={handleInputChange}
      />
    </div>
  );
}
