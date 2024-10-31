import styles from "./page.module.css";
import BlogContent from "components/Blog/BlogContent/BlogContent";
// import NotificationSubscriber from "@components/NotificationSubscriber";

async function getPosts() {
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
  const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/posts?_embed`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  return res.json();
}

async function getCategories() {
  const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
  const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/categories`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }
  return res.json();
}

export default async function Blog() {
  console.log("Blog page loaded");

  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);

  return (
    <div className={styles.blogMain}>
      <div className={styles.blogHeader}>
        <h2 className={styles.blogTitle}>
          Insights on Technology, Consulting, and Digital Transformation.
        </h2>
        {/* <p className={styles.subTitle}>x</p> */}
        <p className={styles.blogDescription}>
          Explore in-depth articles on the latest in IT consulting, cutting-edge
          technologies, and digital strategies that drive business success. From
          Salesforce CRM solutions to operations and management insights, this
          blog offers practical tips, expert analysis, and the latest trends
          shaping the future of the industry.
        </p>
      </div>
      <BlogContent posts={posts} categories={categories} />
    </div>
  );
}
