// import styles from './page.module.css';
import PostList from "../components/PostList/PostList";

export default async function Blog() {
  try {
    return (
      <div>
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
