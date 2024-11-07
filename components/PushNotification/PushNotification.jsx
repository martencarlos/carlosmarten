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
  const [debugInfo, setDebugInfo] = useState("");

  const logDebug = (message) => {
    console.log(message);
    setDebugInfo((prev) => `${prev}\n${new Date().toISOString()}: ${message}`);
  };

  useEffect(() => {
    setIsClient(true);
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      checkNotificationPermission();
    }
  }, []);

  async function checkNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      logDebug(`Notification permission status: ${permission}`);

      if (permission === "granted") {
        registerServiceWorker();
      } else {
        setError("Notification permission denied");
      }
    } catch (error) {
      logDebug(`Permission check error: ${error.message}`);
      setError("Failed to check notification permission");
    }
  }

  async function registerServiceWorker() {
    try {
      logDebug("Registering service worker...");

      // Unregister any existing service workers first
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let reg of registrations) {
        await reg.unregister();
        logDebug("Unregistered existing service worker");
      }

      // Register new service worker
      const reg = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      logDebug("Service worker registered successfully");
      setRegistration(reg);

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      logDebug("Service worker is ready");

      const existingSubscription = await reg.pushManager.getSubscription();
      logDebug(`Existing subscription: ${existingSubscription ? "Yes" : "No"}`);

      setIsSubscribed(!!existingSubscription);
      setSubscription(existingSubscription);
    } catch (error) {
      logDebug(`Service Worker registration error: ${error.message}`);
      setError("Failed to initialize notifications");
    }
  }

  async function handleSubscribe() {
    try {
      setIsLoading(true);
      setError(null);

      logDebug("Attempting to subscribe...");

      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ),
      });

      logDebug("Successfully created push subscription");
      logDebug(`Endpoint: ${pushSubscription.endpoint.slice(0, 50)}...`);

      await subscribeUser(pushSubscription);
      logDebug("Subscription saved to server");

      setIsSubscribed(true);
      setSubscription(pushSubscription);
    } catch (error) {
      logDebug(`Subscription error: ${error.message}`);
      setError("Failed to enable notifications");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUnsubscribe() {
    try {
      setIsLoading(true);
      setError(null);

      logDebug("Unsubscribing...");
      await subscription.unsubscribe();
      await unsubscribeUser(subscription);
      logDebug("Successfully unsubscribed");

      setIsSubscribed(false);
      setSubscription(null);
    } catch (error) {
      logDebug(`Unsubscribe error: ${error.message}`);
      setError("Failed to disable notifications");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isClient) return null;

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

      {/* Debug Info Panel (can be hidden in production) */}
      <div className={styles.debugPanel}>
        <pre>{debugInfo}</pre>
      </div>
    </div>
  );
}
