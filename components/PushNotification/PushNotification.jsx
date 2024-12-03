// components/PushNotification/PushNotification.jsx
"use client";

import { useState, useEffect } from "react";
import { subscribeUser, unsubscribeUser } from "@actions/pushNotifications";
import styles from "./PushNotification.module.css";
import { GoShare } from "react-icons/go";

function urlBase64ToUint8Array(base64String) {
  try {
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
  } catch (error) {
    console.error("Error converting base64 to Uint8Array:", error);
    throw new Error("Invalid VAPID key format");
  }
}

export default function PushNotification() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isCompatibleIOS: false,
    isPWA: false,
  });

  // Detect environment safely
  useEffect(() => {
    try {
      setIsClient(true);

      // Safely check if iOS
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

      // Safely check iOS version
      let isCompatibleIOS = false;
      if (isIOS) {
        const match = navigator.userAgent.match(/OS (\d+)_/);
        const version = match ? parseInt(match[1], 10) : 0;
        isCompatibleIOS = version >= 16;
      }

      // Safely check if PWA
      const isPWA =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;

      setDeviceInfo({ isIOS, isCompatibleIOS, isPWA });

      // Only initialize service worker if appropriate
      if (
        (!isIOS || (isIOS && isCompatibleIOS && isPWA)) &&
        "serviceWorker" in navigator &&
        "PushManager" in window
      ) {
        initializeServiceWorker();
      }
    } catch (error) {
      console.error("Error during initialization:", error);
      setError("Failed to initialize notification system");
    }
  }, []);

  const initializeServiceWorker = async () => {
    try {
      // Check for existing registration first
      const existingReg = await navigator.serviceWorker.getRegistration();

      if (existingReg) {
        console.log("Using existing service worker registration");
        setRegistration(existingReg);

        const existingSub = await existingReg.pushManager.getSubscription();
        if (existingSub) {
          setIsSubscribed(true);
          setSubscription(existingSub);
        }
        return;
      }

      // Only register new service worker if needed
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        setRegistration(reg);
      }
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      // Don't show error to user unless they try to subscribe
    }
  };

  async function handleSubscribe() {
    try {
      setIsLoading(true);
      setError(null);

      // Check if running in PWA mode on iOS
      if (deviceInfo.isIOS && !deviceInfo.isPWA) {
        setError("Please install this website as an app first");
        return;
      }

      // Check iOS compatibility
      if (deviceInfo.isIOS && !deviceInfo.isCompatibleIOS) {
        setError("Notifications require iOS 16.4 or later");
        return;
      }

      // Request permission first
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }

      // Ensure we have a service worker registration
      if (!registration) {
        await initializeServiceWorker();
      }

      if (!registration) {
        throw new Error("Failed to initialize notifications");
      }

      // Subscribe to push
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ),
      };

      const pushSubscription = await registration.pushManager.subscribe(
        subscribeOptions
      );

      // Save to server
      await subscribeUser(pushSubscription);

      setIsSubscribed(true);
      setSubscription(pushSubscription);
    } catch (error) {
      console.error("Subscription error:", error);

      // User-friendly error messages
      if (error.message.includes("permission")) {
        setError("Please allow notifications in your browser settings");
      } else if (error.message.includes("VAPID")) {
        setError("Invalid notification configuration");
      } else {
        setError("Failed to enable notifications. Please try again");
      }
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
      console.error("Unsubscribe error:", error);
      setError("Failed to disable notifications");
    } finally {
      setIsLoading(false);
    }
  }

  // Don't render anything during SSR
  if (!isClient) return null;

  // Show installation instructions for iOS non-PWA
  if (deviceInfo.isIOS && !deviceInfo.isPWA) {
    return (
      <div className={styles.container}>
        <div className={styles.iosInstructions}>
          <h3>Enable Notifications</h3>
          <p>To receive notifications on iOS:</p>
          <ol>
            <li>
              Tap the share button <GoShare className={styles.icon} />
            </li>
            <li>
              Select Add to Home Screen <span className={styles.icon}>+</span>
            </li>
            <li>Open the app from your home screen</li>
            <li>Return here to subscribe</li>
          </ol>
        </div>
      </div>
    );
  }

  // Don't show anything if notifications aren't supported
  if (deviceInfo.isIOS && !deviceInfo.isCompatibleIOS) return null;
  if (!("serviceWorker" in navigator) || !("PushManager" in window))
    return null;

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
