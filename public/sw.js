// public/sw.js

// Cache name for offline support - update version to force refresh
const CACHE_NAME = "carlosmarten-v2";

// Resources to cache
const RESOURCES_TO_CACHE = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/favicon-32x32.png",
];

// Helper function to check if a URL should be cached
function shouldCache(url) {
  const urlObj = new URL(url);
  
  // Skip caching for WordPress API requests
  if (urlObj.pathname.includes('wp-json') || 
      urlObj.hostname === process.env.NEXT_PUBLIC_WP_URL ||
      urlObj.hostname.includes('wdp.carlosmarten.com')) {
    return false;
  }
  
  // Skip caching for dynamic content
  if (urlObj.search.includes('_next/data')) {
    return false;
  }
  
  return true;
}

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

// Updated fetch handler that excludes WordPress content from caching
self.addEventListener("fetch", (event) => {
  // Don't cache WordPress or dynamic content
  if (!shouldCache(event.request.url)) {
    return;
  }
  
  event.respondWith(
    (async () => {
      // Try to get from cache first
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Otherwise fetch from network
      try {
        const networkResponse = await fetch(event.request);
        
        // Only cache successful responses
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // Network error, we can't do much
        console.error('Fetch failed:', error);
        throw error;
      }
    })()
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