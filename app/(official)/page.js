import styles from "./page.module.css";
import PostList from "components/Article/PostList/PostList";
import Hero from "components/Hero/Hero";

// Add this export to disable caching for the entire page
export const dynamic = 'force-dynamic';
// Alternatively, you can use:
export const revalidate = 0;

async function getPosts() {
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
  const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/posts?_embed`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
  return res.json();
}

export default async function Home() {
  const posts = await getPosts();

  try {
    console.log("Home page loaded");
    return (
      <main className={styles.main}>
        <Hero />
        <PostList posts={posts} selectedCategory={null} searchQuery={null} />
      </main>
    );
  } catch (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>Failed to load the blog posts. Please try again later.</p>
      </div>
    );
  }
}
