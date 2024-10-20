// app/dashboard/layout.js

import { auth } from "/auth.js"; // Import the auth middleware
import { redirect } from "next/navigation";

import styles from "./layout.module.css"; // Import your CSS module for layout
import Sidebar from "@components/private/Sidebar/Sidebar"; // Import your Sidebar component

export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session) redirect("/login");

  return (
    <div className={styles.layout}>
      {session && (
        <div>
          <Sidebar />
          <main className={styles.mainContent}>{children}</main>
        </div>
      )}
    </div>
  );
}
