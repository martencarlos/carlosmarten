"use client";
import { useState, useEffect } from "react";
import Card from "components/Article/PostCard/PostCard";
import SkeletonLoader from "components/(aux)/SkeletonLoader/SkeletonLoader";
import styles from "./postlist.module.css";

const POSTS_PER_PAGE = 6; // Adjust this number as needed

export default function PostList({ posts, selectedCategory, searchQuery }) {
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1); // Reset to first page when filters change

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
    } else {
      setFilteredPosts(posts);
    }
    setIsLoading(false);
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
    // window.scrollTo({ top: 0, behavior: "smooth" });
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

  if (!posts || posts.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonLoader key={index} />
        ))}
      </div>
    );
  }

  if (filteredPosts.length === 0 && (selectedCategory || searchQuery)) {
    return (
      <div className={styles.one_column}>
        <p className={styles.noPosts}>
          No posts found for the selected category or search query.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.one_column}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      ) : (
        <>
          <div className={styles.postsInfo}>
            Showing {startIndex + 1}-{Math.min(endIndex, totalPosts)} of{" "}
            {totalPosts} posts
          </div>

          <ul className={styles.ul}>
            {currentPosts.map((post) => (
              <li className={styles.li} key={post.id}>
                <Card post={post} />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={`${styles.pageButton} ${
                  currentPage === 1 ? styles.disabled : ""
                }`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {getPageNumbers().map((number) => (
                <button
                  key={number}
                  className={`${styles.pageButton} ${
                    currentPage === number ? styles.active : ""
                  }`}
                  onClick={() => handlePageChange(number)}
                >
                  {number}
                </button>
              ))}

              <button
                className={`${styles.pageButton} ${
                  currentPage === totalPages ? styles.disabled : ""
                }`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
