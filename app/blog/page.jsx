import styles from "./page.module.css";
import PostList from "../components/PostList/PostList";

export default async function Blog() {
  try {
    return (
      <div className={styles.blogMain}>
        <h1 className={styles.blogTitle}>Latest Posts</h1>
        <br />
        <p className={styles.blogDescription}>
          Welcome to the blog! Here you will find the latest posts.
        </p>
        <PostList />
      </div>
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
