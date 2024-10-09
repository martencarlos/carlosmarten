// app/admin/page.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import LoginForm from "@components/(auth)/LoginForm/LoginForm";
import LoadingComponent from "@components/LoadingComponent/LoadingComponent";
import styles from "./page.module.css";


const Admin = () => {
  const router = useRouter(); // Initialize useRouter
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    };

    getSession();
  }, []);

  useEffect(() => {
    // Redirect to dashboard if session exists
    if (!loading) {
      if (session) {
        router.push("/dashboard"); // Redirect to the dashboard page
      }
    }
  }, [loading, session, router]);

  // Check if the component is mounted before rendering
  if (loading) {
    return (
      <div className={styles.adminPage}>
        <LoadingComponent />
      </div>
    );
  }

  // If there is no session, render the login form
  return !session ? (
    <LoginForm setSession={setSession} />
  ) : null; // The redirection will handle displaying the dashboard
};

export default Admin;
