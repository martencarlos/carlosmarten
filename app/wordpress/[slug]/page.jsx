// Import the server action
import { fetchWordPressPage } from "@actions/actions";
import styles from "./page.module.css";

export default async function WordPressPage({ params }) {
  const htmlContent = await fetchWordPressPage(params.slug);

  if (!htmlContent) {
    return <div className={styles.pageContainer}>Page not found</div>;
  } else
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    );
}
