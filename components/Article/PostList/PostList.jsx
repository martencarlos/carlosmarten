//components / Article / PostList / PostList.jsx
"use client";
import { useState, useEffect } from "react";
import Card from "components/Article/PostCard/PostCard";
import PostListSkeleton from "./PostListSkeleton";
import styles from "./postlist.module.css";

const POSTS_PER_PAGE = 6;

export default function PostList({ posts, selectedCategory, searchQuery, viewCounts = {} }) {
  // Initialize with posts to enable SSR rendering
  const [filteredPosts, setFilteredPosts] = useState(posts || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Update filtered posts when inputs change
  useEffect(() => {
    // Logic: If props change on client (e.g. search), filter.
    const filterPosts = () => {
      if (selectedCategory || searchQuery) {
        setIsLoading(true);
        const filtered = posts.filter((post) => {
          const matchesCategory =
            !selectedCategory || post.categories.includes(selectedCategory);
          const matchesSearch =
            !searchQuery ||
            post.title.rendered.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesCategory && matchesSearch;
        });
        setFilteredPosts(filtered);
        setIsLoading(false);
      } else {
        setFilteredPosts(posts);
      }
    };

    filterPosts();
    setCurrentPage(1);
  }, [posts, selectedCategory, searchQuery]);

  // Pagination calculations
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setIsLoading(true);
    setCurrentPage(pageNumber);
    setTimeout(() => setIsLoading(false), 300);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  if (!posts) {
    return (
      <div className={styles.loadingContainer}>
        <PostListSkeleton count={3} />
      </div>
    );
  }

  // Handle "No posts found"
  if (filteredPosts.length === 0 && (selectedCategory || searchQuery)) {
    return (
      <div className={styles.one_column}>
        <p className={styles.noPosts}>
          No posts found for the selected category or search query.
        </p>
      </div>
    );
  }

  // Handle client-side filtering loading state
  if (isLoading) {
    return (
      <div className={styles.one_column}>
        <div className={styles.loadingContainer}>
          <PostListSkeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.one_column}>
      <ul className={styles.ul}>
        {currentPosts.map((post) => (
          <li className={styles.li} key={post.id}>
            <Card post={post} views={viewCounts[post.slug] || 0} />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ""
              }`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {getPageNumbers().map((number) => (
            <button
              key={number}
              className={`${styles.pageButton} ${currentPage === number ? styles.active : ""
                }`}
              onClick={() => handlePageChange(number)}
            >
              {number}
            </button>
          ))}

          <button
            className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ""
              }`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}