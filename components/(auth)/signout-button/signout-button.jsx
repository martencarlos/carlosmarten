"use client"; // This is a client component
import { signOut } from "next-auth/react";
import styles from "@components/private/Sidebar/sidebar.module.css";

export default function SignOutButton() {
  return (
    <button
      className={styles.logout}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sign Out
    </button>
  );
}
