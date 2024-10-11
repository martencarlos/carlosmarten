// components/Dashboard.js

import styles from "./page.module.css";

export default async function Dashboard() {
  console.log("Dashboard loaded");

  return (
    <div className={styles.dashboard}>
      <h2>Dashboard</h2>
    </div>
  );
}
