import styles from "./loadingcomponent.module.css";

export default function LoadingComponent() {
  return (
    <div ClassName={styles.loadingContainer}>
      <h1 className={styles.text}>Loading...</h1>
    </div>
  );
}
