import { useState, useEffect } from "react";
import styles from "./categorylist.module.css";
import LoadingComponent from "@components/LoadingComponent/LoadingComponent";

async function getCategories() {
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
  const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/categories`, {
    next: { revalidate: 60 },
  });
  
  // Handle errors in fetching
  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }
  
  return res.json();
}

export default function CategoryList({ onSelectCategory, selectedCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        setError(err.message); // Capture any errors during fetch
      } finally {
        setLoading(false); // Set loading to false after fetch attempt
      }
    }
    fetchCategories();
  }, []);

  // Conditional rendering based on loading and error states
  if (loading) {
    return (
      <div className={styles.categoryList}>
        <LoadingComponent />
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error message if fetching fails
  }

  return (
    <div className={styles.categoryList}>
      <h2>Categories</h2>
      <br />
      <ul>
        <li key="all">
          <button
            className={selectedCategory === null ? styles.active : ""}
            onClick={() => onSelectCategory(null)}
          >
            All
          </button>
        </li>
        {categories.map((category) => (
          category.name !== "Uncategorized" && <li key={category.id}>
            <button
              className={selectedCategory === category.id ? styles.active : ""}
              onClick={() => onSelectCategory(category.id)}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
