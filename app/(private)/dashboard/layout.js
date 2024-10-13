// app/dashboard/layout.js

import { auth } from "/auth.js"; // Import the auth middleware

import styles from "./layout.module.css"; // Import your CSS module for layout
import Sidebar from "@components/private/Sidebar/Sidebar"; // Import your Sidebar component

export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session.user)
    return (
      <div>
        <h1>Access Denied</h1>
        <p>You must be signed in to access this page.</p>
      </div>
    );
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
