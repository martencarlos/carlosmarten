// app/dashboard/layout.js
"use client";
import Sidebar from "@components/(auth)/Sidebar/Sidebar"; // Import your Sidebar component
import styles from "./layout.module.css"; // Import your CSS module for layout
import { useRouter } from "next/navigation"; // For redirection
import { useEffect, useState } from "react"; // For state management
import LoadingComponent from "@components/LoadingComponent/LoadingComponent"; // Import your loading component

const DashboardLayout = ({ children }) => {
  const router = useRouter(); // Initialize useRouter
  // const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); // Initialize loading state

  useEffect(() => {
    const checkSession = async () => {
      const response = await fetch("/api/session"); // Use your API route to check session
      if (response.ok) {
        const { session } = await response.json();
        if (session) {
          // setSession(session); // Set session if valid
          setLoading(false); // Stop loading
        } else {
          router.push("/admin"); // Redirect to login page if no session
        }
      } else {
        router.push("/admin"); // Redirect on error
      }
    };

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.layout}>
        <LoadingComponent />
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
};

export default DashboardLayout;
