// Path: app/(official)/page.js
import styles from "./page.module.css";
import PostList from "components/Article/PostList/PostList";
import Hero from "components/Hero/Hero";
import { Suspense } from "react";
import PostListSkeleton from "@components/Article/PostList/PostListSkeleton";
import { getViewsCount } from "@actions/viewCounter";

// Enable streaming and ISR
export const dynamic = 'force-dynamic';
export const revalidate = 60;

async function getPosts() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
    const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/posts?_embed`, {
      next: { revalidate: 60 },
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch posts. Status: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

// Metadata for SEO
export const metadata = {
  title: 'Carlos Marten - Technology meets Business',
  description: 'Digital transformation leader specializing in IT consulting, business technology, and web development',
};

// Separate component for async post data
async function PostsData() {
  const [posts, viewCounts] = await Promise.all([
    getPosts(),
    getViewsCount()
  ]);

  return <PostList posts={posts} viewCounts={viewCounts} selectedCategory={null} searchQuery={null} />;
}

export default async function Home() {
  console.log("Home page loaded");

  return (
    <main className={styles.main}>
      <Hero />
      <Suspense fallback={<PostListSkeleton />}>
        <PostsData />
      </Suspense>
    </main>
  );
}