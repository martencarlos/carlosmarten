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
  const [isPWA, setIsPWA] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const logDebug = (message) => {
    console.log(message);
  };

  // Check device and PWA status
  useEffect(() => {
    setIsClient(true);

    // Check if running as PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone;
    setIsPWA(isStandalone);

    // Check if iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // Check iOS version (needed for push notification support)
    if (isIOS) {
      const version = parseInt(
        navigator.userAgent.match(/OS (\d+)_/)?.[1] || "0"
      );

      if (!isStandalone) {
        setShowIOSInstructions(true);
      }
    }

    // Check for existing subscription if conditions are met
    if ((isStandalone && isIOS && version >= 16) || !isIOS) {
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        logDebug("Push notifications not supported");
        return;
      }

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
          setRegistration(existingRegistration);
        }
      }
    } catch (error) {
      logDebug(`Initialization error: ${error.message}`);
    }
  };

  async function handleSubscribe() {
    try {
      setIsLoading(true);
      setError(null);

      // Special handling for iOS
      if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !isPWA) {
        setShowIOSInstructions(true);
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }

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
      await subscribeUser(pushSubscription);

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
        await unsubscribeUser(subscription);
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      setSubscription(null);
    } catch (error) {
      setError("Failed to unsubscribe");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isClient) return null;

  // Show installation instructions for iOS
  if (showIOSInstructions) {
    return (
      <div className={styles.container}>
        <div className={styles.iosInstructions}>
          <h3>Enable Push Notifications</h3>
          <p>To receive notifications on iOS:</p>
          <ol>
            <li>
              Tap the share button <span>⎋</span>
            </li>
            <li>
              Select &quot;Add to Home Screen&quot; <span>+</span>
            </li>
            <li>Open the app from your home screen</li>
            <li>Come back here and tap Subscribe</li>
          </ol>
          <button
            className={styles.button}
            onClick={() => setShowIOSInstructions(false)}
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  // Don't show subscribe button if not compatible
  if (!isPWA && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
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
          ? "Unsubscribe from notifications"
          : "Subscribe to notifications"}
      </button>
    </div>
  );
}
