// Path: app/(official)/categories/[slug]/page.jsx
"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Card from "components/Article/PostCard/PostCard";
import PostListSkeleton from "@components/Article/PostList/PostListSkeleton";
const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
import { useParams } from "next/navigation";

async function getCategories() {
  const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/categories`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
  return res.json();
}

// Function to get the ID by category name
const getCategoryIdByName = async (categoriesArray, categoryName) => {
  const category = categoriesArray.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  return category ? category.id : null;
};

async function getCategoryPosts(categoryId) {
  const res = await fetch(
    `https://${siteUrl}/wp-json/wp/v2/posts?categories=${categoryId}`,
    {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }
  );
  return res.json();
}

export default function Categories() {
  const params = useParams();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = decodeURIComponent(params.slug);

  useEffect(() => {
    async function fetchData() {
      const categoriesArray = await getCategories();
      const categoryId = await getCategoryIdByName(categoriesArray, category);
      const posts = await getCategoryPosts(categoryId);
      setPosts(posts);
      setLoading(false);
    }
    fetchData();
  }, [category]);

  if (loading) {
    return (
      <div className={styles.one_column}>
        <div className={styles.blogHeader}>
          <h1 className={styles.h1}>Category: </h1>
          <h2 className={styles.pill}>{category}</h2>
        </div>
        <PostListSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className={styles.one_column}>
      <div className={styles.blogHeader}>
        <h1 className={styles.h1}>Category: </h1>
        <h2 className={styles.pill}>{category}</h2>
      </div>
      <ul className={styles.ul}>
        {posts &&
          posts.map((post) => (
            <li className={styles.li} key={post.id}>
              <Card post={post} />
            </li>
          ))}
      </ul>
    </div>
  );
}