// Path: app/(official)/blog/page.jsx
import styles from "./page.module.css";
import BlogContent from "components/Blog/BlogContent/BlogContent";
import PushNotification from "@components/PushNotification/PushNotification";
import { Suspense } from "react";
import PostListSkeleton from "@components/Article/PostList/PostListSkeleton";

// Enable streaming and ISR
export const dynamic = 'force-dynamic';
export const revalidate = 30; // Revalidate every 30 seconds

async function getPosts() {
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
  
  try {
    const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/posts?_embed`, {
      next: { revalidate: 30 },
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch posts");
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

async function getCategories() {
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
  
  try {
    const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/categories`, {
      next: { revalidate: 300 }, // Categories change less frequently
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch categories");
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Generate metadata for better SEO
export const metadata = {
  title: 'Blog - Carlos Marten',
  description: 'Insights on Technology, Consulting, and Digital Transformation',
};

// Separate component for async data
async function BlogData() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);
  
  return <BlogContent posts={posts} categories={categories} />;
}

export default async function Blog() {
  console.log("Blog page loaded");

  return (
    <div className={styles.blogMain}>
      <div className={styles.blogHeader}>
        <h2 className={styles.blogTitle}>
          Insights on Technology, Consulting, and Digital Transformation.
        </h2>
        <p className={styles.blogDescription}>
          Explore in-depth articles on the latest in IT consulting, cutting-edge
          technologies, and digital strategies that drive business success. From
          Salesforce CRM solutions to operations and management insights, this
          blog offers practical tips, expert analysis, and the latest trends
          shaping the future of the industry.
        </p>
        <PushNotification />
      </div>
      
      <Suspense fallback={<PostListSkeleton />}>
        <BlogData />
      </Suspense>
    </div>
  );
}