import styles from "./page.module.css";
import { fetchWordPressPage } from "@actions/actions";

export default async function WordPress() {
  const htmlContent = await fetchWordPressPage("/");

  if (!htmlContent) {
    return <div className={styles.pageContainer}>Page not found</div>;
  } else
    return (
      <div className={styles.pageContainer}>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    );
}
