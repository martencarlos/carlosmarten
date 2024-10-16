import styles from "./page.module.css";
import PostList from "components/Article/PostList/PostList";
import Hero from "components/Hero/Hero";

async function getPosts() {
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
  const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/posts?_embed`, {
    next: { revalidate: 60 },
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
