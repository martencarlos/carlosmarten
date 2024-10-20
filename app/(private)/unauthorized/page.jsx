"use client"; // Client-side for App Router

import { useRouter } from "next/navigation";

import styles from "./page.module.css";

export default function UnauthorizedPage() {
  const router = useRouter();
  const errorMessage = "You are not authorized to sign in.";

  return (
    <div className={styles.container}>
      <h1 className={styles.error}>Access Denied</h1>

      <p>{errorMessage}</p>

      <button className={styles.button} onClick={() => router.push("/login")}>
        {" "}
        Go back to login
      </button>
    </div>
  );
}
