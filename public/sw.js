// public/sw.js

// Cache name for offline support
const CACHE_NAME = "carlosmarten-v1";

// Resources to cache
const RESOURCES_TO_CACHE = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/favicon-32x32.png",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  // Force waiting Service Worker to become active
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(RESOURCES_TO_CACHE);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  // Take control of all pages immediately
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      }),
    ])
  );
});

self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  if (event.data) {
    try {
      const data = event.data.json();
      console.log("Push data:", data);

      const options = {
        body: data.body,
        icon: "/android-chrome-192x192.png",
        badge: "/favicon-32x32.png",
        vibrate: [100],
        tag: data.tag || "blog-notification",
        renotify: true,
        data: {
          url: data.url || "/",
          // Store the URL in both places for compatibility
          openUrl: data.url || "/",
          origin: self.registration.scope,
        },
        // Simplified actions without icons for better compatibility
        // actions: [
        //   {
        //     action: "open",
        //     title: "Read More",
        //   },
        //   {
        //     action: "close",
        //     title: "Close",
        //   },
        // ],
      };

      event.waitUntil(
        self.registration
          .showNotification(data.title, options)
          .then(() => console.log("Notification shown successfully"))
          .catch((error) => {
            console.error("Error showing notification:", error);
            // Fallback to basic notification
            return self.registration.showNotification(data.title, {
              body: data.body,
              icon: "/android-chrome-192x192.png",
              data: { url: data.url || "/" },
            });
          })
      );
    } catch (error) {
      console.error("Error processing push data:", error);
    }
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const urlToOpen = new URL(
    event.notification.data.url || "/",
    self.registration.scope
  ).href;

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        // iOS Safari doesn't support clients.openWindow in all cases
        // so we try to focus an existing window first
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }

        // If no existing window, try to open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event.notification);
});

// Add fetch handler for offline support
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Helper function to check if a client is focused
async function isClientFocused() {
  const windowClients = await clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  return windowClients.some((client) => client.focused);
}

// Periodic sync for keeping the service worker alive
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "keep-alive") {
    event.waitUntil(
      // Perform minimal task to keep service worker active
      Promise.resolve()
    );
  }
});
