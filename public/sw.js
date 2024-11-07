// public/sw.js
const CACHE_VERSION = "v1";
const CACHE_NAME = `push-notification-${CACHE_VERSION}`;

self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",
        "/android-chrome-192x192.png",
        "/favicon-32x32.png",
      ]);
    })
  );
  // Force the waiting service worker to become active
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    Promise.all([
      // Take control of all clients
      self.clients.claim(),
      // Remove old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith("push-notification-"))
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        );
      }),
    ])
  );
});

self.addEventListener("push", (event) => {
  console.log("Push event received");

  if (event.data) {
    try {
      const data = event.data.json();
      console.log("Push data:", data);

      const options = {
        body: data.body,
        icon: "/android-chrome-192x192.png",
        badge: "/favicon-32x32.png",
        vibrate: [200, 100, 200],
        tag: "blog-notification",
        renotify: true,
        requireInteraction: true,
        data: {
          url: data.url || "/",
          time: new Date().getTime(),
        },
        actions: [
          {
            action: "open",
            title: "Read More",
          },
          {
            action: "close",
            title: "Close",
          },
        ],
      };

      event.waitUntil(
        self.registration
          .showNotification(data.title, options)
          .then(() => console.log("Notification shown"))
          .catch((error) => console.error("Show notification error:", error))
      );
    } catch (error) {
      console.error("Push event processing error:", error);
    }
  }
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked");

  event.notification.close();

  if (event.action === "close") return;

  const urlToOpen = event.notification.data.url || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow(urlToOpen);
      })
  );
});
