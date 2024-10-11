// app/admin/page.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import LoadingComponent from "@components/(aux)/LoadingComponent/LoadingComponent";
import styles from "./page.module.css";

export default function Admin() {
  const router = useRouter(); // Initialize useRouter
  const [session, setSession] = useState(null);

  // Fetch the session data when the component mounts
  useEffect(() => {
    const getSession = async () => {
      const response = await fetch("/api/session");
      if (response.ok) {
        const { session } = await response.json();
        setSession(session);
      } else {
        setSession(null); // Handle session retrieval failure
      }
      // setLoading(false);
    };

    getSession();
  }, []);

  if (!session) {
    router.push("/login");
  } else if (session) {
    router.push("/dashboard");
  }

  return (
    <div className={styles.adminPage}>
      <LoadingComponent />
    </div>
  );
}
