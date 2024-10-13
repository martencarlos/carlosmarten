// app/dashboard/layout.js

import styles from "./layout.module.css"; // Import your CSS module for layout
import Sidebar from "@components/private/Sidebar/Sidebar"; // Import your Sidebar component

export default async function DashboardLayout({ children }) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
