// Import the server action
import { fetchWordPressPage } from "@actions/actions";
import styles from "./page.module.css";

export default async function WordPressPage({ params }) {
  const htmlContent = await fetchWordPressPage(params.slug);

  if (!htmlContent) {
    return <div className={styles.pageContainer}>Page not found</div>;
  } else {
    const updatedContent = htmlContent.replace(
      /https:\/\/wp\.carlosmarten\.com/g,
      `${process.env.HOST}/wordpress`
    );
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: updatedContent }} />
      </div>
    );
  }
}
