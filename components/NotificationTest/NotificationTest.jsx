// components/NotificationTest/NotificationTest.jsx
"use client";

import { useState } from "react";
import { sendTestNotification } from "@actions/pushNotifications";
import styles from "./NotificationTest.module.css";

export default function NotificationTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("This is a test notification!");

  async function handleTestNotification() {
    try {
      setIsLoading(true);
      setError(null);

      const result = await sendTestNotification({
        title: "Test Notification",
        content: message,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to send notification");
      }

      alert("Test notification sent successfully!");
    } catch (err) {
      console.error("Error sending test notification:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Test Push Notifications</h3>
      <textarea
        className={styles.textarea}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter test notification message"
      />
      {error && <p className={styles.error}>{error}</p>}
      <button
        className={`${styles.button} ${isLoading ? styles.loading : ""}`}
        onClick={handleTestNotification}
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send Test Notification"}
      </button>
    </div>
  );
}
