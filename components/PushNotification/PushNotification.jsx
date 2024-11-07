// components/PushNotification/PushNotification.jsx
"use client";

import { useState, useEffect } from "react";
import { subscribeUser, unsubscribeUser } from "@actions/pushNotifications";
import styles from "./PushNotification.module.css";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotification() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      setRegistration(reg);

      const existingSubscription = await reg.pushManager.getSubscription();
      setIsSubscribed(!!existingSubscription);
      setSubscription(existingSubscription);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      setError("Failed to initialize notifications");
    }
  }

  async function handleSubscribe() {
    try {
      setIsLoading(true);
      setError(null);

      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ),
      });

      await subscribeUser(pushSubscription);

      setIsSubscribed(true);
      setSubscription(pushSubscription);
    } catch (error) {
      console.error("Failed to subscribe:", error);
      setError("Failed to enable notifications");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUnsubscribe() {
    try {
      setIsLoading(true);
      setError(null);

      await subscription.unsubscribe();
      await unsubscribeUser(subscription);

      setIsSubscribed(false);
      setSubscription(null);
    } catch (error) {
      console.error("Error unsubscribing:", error);
      setError("Failed to disable notifications");
    } finally {
      setIsLoading(false);
    }
  }

  // Don't render anything during SSR
  if (!isClient) {
    return null;
  }

  // Check for browser support after client-side hydration
  if (
    typeof window !== "undefined" &&
    (!("serviceWorker" in navigator) || !("PushManager" in window))
  ) {
    return null;
  }

  return (
    <div className={styles.container}>
      {error && <p className={styles.error}>{error}</p>}
      <button
        className={`${styles.button} ${isLoading ? styles.loading : ""}`}
        onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
        disabled={isLoading}
      >
        {isLoading
          ? "Processing..."
          : isSubscribed
          ? "Unsubscribe"
          : "Subscribe to get notified of new posts"}
      </button>
    </div>
  );
}
