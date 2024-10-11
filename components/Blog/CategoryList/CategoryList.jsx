"use client";

import styles from "./categorylist.module.css";

export default function CategoryList({
  categories,
  onSelectCategory,
  selectedCategory,
}) {
  console.log("CategoryList loaded" + "- ID: " + selectedCategory);

  if (!categories) {
    return null;
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
        {categories.map(
          (category) =>
            category.name !== "Uncategorized" && (
              <li key={category.id}>
                <button
                  className={
                    selectedCategory === category.id ? styles.active : ""
                  }
                  onClick={() => onSelectCategory(category.id)}
                >
                  {category.name}
                </button>
              </li>
            )
        )}
      </ul>
    </div>
  );
}
