"use client";

import { useState, useEffect } from "react";
import { subscribeUser, unsubscribeUser } from "@actions/actions";

export default function NotificationSubscriber() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
    setIsLoading(false);
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });
      setSubscription(sub);
      await subscribeUser(sub);
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
    }
  }

  async function unsubscribeFromPush() {
    try {
      await subscription?.unsubscribe();
      setSubscription(null);
      await unsubscribeUser();
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
    }
  }

  async function sendTestNotification() {
    try {
      const response = await fetch("/api/webhook", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to send test notification");
      }

      console.log("Test notification sent");
    } catch (error) {
      console.error("Error sending test notification:", error);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isSupported) {
    return <div>Push notifications are not supported in this browser.</div>;
  }

  return (
    <div>
      {subscription ? (
        <div>
          <p>You are subscribed to blog post notifications!</p>
          <button onClick={unsubscribeFromPush}>
            Unsubscribe from notifications
          </button>
          <button onClick={sendTestNotification}>Send Test Notification</button>
        </div>
      ) : (
        <div>
          <p>Get notified when new blog posts are published!</p>
          <button onClick={subscribeToPush}>Subscribe to notifications</button>
        </div>
      )}
    </div>
  );
}
