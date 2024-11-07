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

      // Wake lock to ensure notification shows in background
      const showNotification = async () => {
        try {
          // Create notification options
          const options = {
            body: data.body,
            icon: "/android-chrome-192x192.png",
            badge: "/favicon-32x32.png",
            vibrate: [200, 100, 200],
            tag: data.tag || "blog-notification",
            renotify: true,
            requireInteraction: true,
            silent: false,
            timestamp: Date.now(),
            data: {
              url: data.url || "/",
              postId: data.id,
              openUrl: data.url || "/",
              // Add origin for proper URL handling
              origin: self.registration.scope,
            },
            actions: [
              {
                action: "open",
                title: "Read More",
                icon: "/favicon-32x32.png",
              },
              {
                action: "close",
                title: "Close",
                icon: "/favicon-32x32.png",
              },
            ],
          };

          // Show the notification
          await self.registration.showNotification(data.title, options);
          console.log("Notification shown successfully");
        } catch (error) {
          console.error("Error showing notification:", error);
          // Fallback to basic notification if complex one fails
          await self.registration.showNotification(data.title, {
            body: data.body,
            icon: "/android-chrome-192x192.png",
          });
        }
      };

      // Use waitUntil to keep the service worker alive
      event.waitUntil(showNotification());
    } catch (error) {
      console.error("Error processing push data:", error);
    }
  }
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  // Close the notification
  event.notification.close();

  if (event.action === "close") return;

  // Get URL to open
  const urlToOpen = new URL(
    event.notification.data.openUrl || "/",
    event.notification.data.origin || self.registration.scope
  ).href;

  console.log("Opening URL:", urlToOpen);

  const promiseChain = (async () => {
    try {
      // Try to find existing window first
      const windowClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      console.log("Existing windows:", windowClients.length);

      // Look for an existing window to focus
      for (const windowClient of windowClients) {
        if (windowClient.url === urlToOpen) {
          await windowClient.focus();
          return;
        }
      }

      // If no existing window found, open new one
      const client = await clients.openWindow(urlToOpen);
      if (client) await client.focus();
    } catch (error) {
      console.error("Error handling notification click:", error);
      // Fallback to basic window opening
      await clients.openWindow(urlToOpen);
    }
  })();

  event.waitUntil(promiseChain);
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
