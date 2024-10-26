import LoadingComponent from "@components/(aux)/LoadingComponent/LoadingComponent";
import styles from "@components/(aux)/LoadingComponent/loadingcomponent.module.css";

export default function Loading() {
  // Or a custom loading skeleton component
  return (
    <div className={styles.loadingContainerFullPage}>
      <LoadingComponent />
    </div>
  );
}
