import styles from "./page.module.css";
import Card from "../../components/Card/Card";
const siteUrl = process.env.NEXT_PUBLIC_WP_URL;
async function getCategories() {
  const res = await fetch(`https://${siteUrl}/wp-json/wp/v2/categories`);
  return res.json();
}

// Function to get the ID by category name
const getCategoryIdByName = (categoriesArray, categoryName) => {
  const category = categoriesArray.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  );
  return category ? category.id : null; // Return ID or null if not found
};

async function getCategoryPosts(categoryId) {
  const res = await fetch(
    `https://${siteUrl}/wp-json/wp/v2/posts?categories=${categoryId}`
  );
  return res.json();
}

export default async function Categories({ params }) {
  try {
    const category = params.slug;

    const categoriesArray = await getCategories();
    const categoryId = getCategoryIdByName(categoriesArray, category);
    const posts = await getCategoryPosts(categoryId);

    return (
      <div className={styles.one_column}>
        <div className={styles.blogHeader}>
          <h1 className={styles.h1}>Category: </h1>
          <h2 className={styles.pill}>{category}</h2>
        </div>
        <ul className={styles.ul}>
          {posts.map((post) => (
            <li className={styles.li} key={post.id}>
              <Card post={post} />
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
