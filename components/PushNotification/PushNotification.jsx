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

  // Only check for existing subscription on mount
  useEffect(() => {
    setIsClient(true);

    const checkExistingSubscription = async () => {
      try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
          logDebug("Push notifications not supported");
          return;
        }

        // Check for existing service worker registration
        const existingRegistration =
          await navigator.serviceWorker.getRegistration();

        if (existingRegistration) {
          logDebug("Found existing service worker");
          const pushSubscription =
            await existingRegistration.pushManager.getSubscription();

          if (pushSubscription) {
            logDebug("Found existing push subscription");
            setIsSubscribed(true);
            setSubscription(pushSubscription);
            setRegistration(existingRegistration);
          } else {
            // Just store the registration for later use
            setRegistration(existingRegistration);
          }
        }
      } catch (error) {
        logDebug(`Initialization error: ${error.message}`);
      }
    };

    checkExistingSubscription();
  }, []);

  async function handleSubscribe() {
    try {
      setIsLoading(true);
      setError(null);

      logDebug("Manual subscription starting...");

      // Request permission here instead of on load
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }

      // Get or create service worker registration
      const reg =
        registration ||
        (await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        }));

      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ),
      };

      const pushSubscription = await reg.pushManager.subscribe(
        subscribeOptions
      );
      logDebug("Push subscription created");

      await subscribeUser(pushSubscription);
      logDebug("Subscription saved to server");

      setIsSubscribed(true);
      setSubscription(pushSubscription);
      setRegistration(reg);
    } catch (error) {
      logDebug(`Subscription error: ${error.message}`);
      setError(
        error.message === "Notification permission denied"
          ? "Please allow notifications to subscribe"
          : "Failed to subscribe to notifications"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUnsubscribe() {
    try {
      setIsLoading(true);
      setError(null);

      if (subscription) {
        logDebug("Unsubscribing...");
        await unsubscribeUser(subscription);
        await subscription.unsubscribe();
        logDebug("Unsubscribed successfully");
      }

      setIsSubscribed(false);
      setSubscription(null);
    } catch (error) {
      logDebug(`Unsubscribe error: ${error.message}`);
      setError("Failed to unsubscribe");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isClient) return null;

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
          ? "Unsubscribe from notifications"
          : "Subscribe to notifications"}
      </button>

      <div className={styles.debugPanel}>
        <pre>{debugInfo}</pre>
      </div>
    </div>
  );
}
