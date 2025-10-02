// components/ServiceWorkerUpdatePrompt/ServiceWorkerUpdatePrompt.jsx
"use client";

import { useEffect, useState } from "react";
import styles from "./ServiceWorkerUpdatePrompt.module.css";

export default function ServiceWorkerUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Check for service worker updates
    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);

      // Check for updates every 5 minutes
      const interval = setInterval(() => {
        reg.update();
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "SW_UPDATED") {
        setShowPrompt(true);
      }
    });

    // Listen for updates
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      // Don't show prompt if this is the first service worker
      if (navigator.serviceWorker.controller) {
        setShowPrompt(true);
      }
    });
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    
    // Reload the page to get the new content
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.prompt}>
        <div className={styles.content}>
          <h3 className={styles.title}>New Version Available</h3>
          <p className={styles.message}>
            A new version of this website is available. Reload to get the latest updates.
          </p>
          <div className={styles.buttons}>
            <button onClick={handleUpdate} className={styles.updateButton}>
              Update Now
            </button>
            <button onClick={handleDismiss} className={styles.dismissButton}>
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}