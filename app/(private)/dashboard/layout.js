// app/dashboard/layout.js

import { supabase } from "@lib/supabaseClient";
import { redirect } from "next/navigation"; // For redirection

import styles from "./layout.module.css"; // Import your CSS module for layout
import Sidebar from "@components/private/Sidebar/Sidebar"; // Import your Sidebar component

export default async function DashboardLayout({ children }) {
  const session = await supabase.auth.getSession();

  if (session.data.session === null) {
    redirect("/login");
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
