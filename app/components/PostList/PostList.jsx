import PostCard from "../PostCard/PostCard.jsx";
import styles from "./postlist.module.css";

async function getPosts() {
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
  const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/posts?_embed`, {
    next: { revalidate: 60 },
  });
  return res.json();
}

export default async function Blog() {
  try {
    const posts = await getPosts();
    return (
      <div className={styles.one_column}>
        {/* <h1 className={styles.h1}>Latest posts</h1> */}
        <ul className={styles.ul}>
          {posts.map((post) => (
            <li className={styles.li} key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
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
