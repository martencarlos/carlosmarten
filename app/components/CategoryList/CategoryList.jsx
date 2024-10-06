import { useState, useEffect } from "react";
import styles from "./categorylist.module.css";

async function getCategories() {
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
  const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/categories`, {
    next: { revalidate: 60 },
  });
  return res.json();
}

export default function CategoryList({ onSelectCategory, selectedCategory }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    }
    fetchCategories();
  }, []);

  return (
    <div className={styles.categoryList}>
      <h2>Categories</h2>
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
          <li key={category.id}>
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
