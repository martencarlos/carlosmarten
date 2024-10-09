import styles from "./loadingcomponent.module.css";


export default function LoadingComponent() {
  console.log("Loading component loaded");
  return (
    <div className={styles.loader}>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
    </div>
  );
}
