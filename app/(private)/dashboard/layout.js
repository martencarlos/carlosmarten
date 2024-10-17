// app/dashboard/layout.js

import { auth } from "/auth.js"; // Import the auth middleware

import styles from "./layout.module.css"; // Import your CSS module for layout
import Sidebar from "@components/private/Sidebar/Sidebar"; // Import your Sidebar component

export default async function DashboardLayout({ children }) {
  const session = await auth();
  console.log(session);

  if (!session) {
    return (
      <div className={styles.layout}>
        <h1 className={styles.error}>Access Denied</h1>
        <p>You must be signed in to access this page.</p>
      </div>
    );
  } else {
    return (
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.mainContent}>{children}</main>
      </div>
    );
  }
}
