// app/(official)/page.js
import styles from "./page.module.css";
import PostList from "components/Article/PostList/PostList";
import Hero from "components/Hero/Hero";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getPosts() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
    const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/posts?_embed`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch posts. Status: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    // Return an empty array instead of letting the error propagate
    // This way, the page will still render even if the fetch fails
    return [];
  }
}

export default async function Home() {
  console.log("Home page loaded");
  
  // Fetch posts and handle any errors
  const posts = await getPosts();
  
  return (
    <main className={styles.main}>
      <Hero />
      <PostList posts={posts} selectedCategory={null} searchQuery={null} />
    </main>
  );
}