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

// --- START OF MODIFICATION ---
// This value needs to be set, ideally by your build process.
// It should be the HOSTNAME of your WordPress instance.
//
// Original code used: process.env.NEXT_PUBLIC_WP_URL
//
// If process.env.NEXT_PUBLIC_WP_URL is a full URL (e.g., "https://mywp.example.com/api"),
// then CONFIGURED_WP_HOSTNAME should be set to its hostname part (e.g., "mywp.example.com").
// If process.env.NEXT_PUBLIC_WP_URL is already just the hostname (e.g., "mywp.example.com"),
// then CONFIGURED_WP_HOSTNAME should be set to that value.
//
// Example: If your build system can replace placeholders:
// const CONFIGURED_WP_HOSTNAME = "__REPLACE_WITH_WP_HOSTNAME__";
// Otherwise, you might need to hardcode it if it's static, or fetch it.
const CONFIGURED_WP_HOSTNAME = "wdp.carlosmarten.com"; // E.g., "wdp.carlosmarten.com" or the hostname from your env var.
                                   // IMPORTANT: Ensure this is populated correctly.
// --- END OF MODIFICATION ---


// Helper function to check if a URL should be cached
function shouldCache(url) {
  const urlObj = new URL(url); // Parses the request URL string

  // Skip caching for WordPress API requests or content from the configured WP host
  const isWpJsonPath = urlObj.pathname.includes('wp-json');
  
  // Check against the configured WP hostname (if it's set)
  const isConfiguredWpHost = CONFIGURED_WP_HOSTNAME && urlObj.hostname === CONFIGURED_WP_HOSTNAME;
  
  // Check against the hardcoded 'wdp.carlosmarten.com'
  // This might be redundant if CONFIGURED_WP_HOSTNAME is set to 'wdp.carlosmarten.com',
  // but kept for consistency with the original logic if they serve different purposes.
  const isHardcodedWpDomain = urlObj.hostname.includes('wdp.carlosmarten.com');

  if (isWpJsonPath || isConfiguredWpHost || isHardcodedWpDomain) {
    return false;
  }

  // Skip caching for Next.js dynamic data routes
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
      console.log("Caching app shell resources:", RESOURCES_TO_CACHE);
      return cache.addAll(RESOURCES_TO_CACHE);
    }).catch(error => {
      console.error("Failed to cache app shell resources during install:", error);
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
            .map((name) => {
              console.log("Deleting old cache:", name);
              return caches.delete(name);
            })
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
      // Fallback for non-JSON data or other errors
      const title = "New Notification";
      const body = event.data.text ? event.data.text() : "You have a new update.";
      event.waitUntil(
        self.registration.showNotification(title, {
          body: body,
          icon: "/android-chrome-192x192.png",
          data: { url: "/" },
        })
      );
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
        // Try to focus an existing window/tab that has the URL.
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }

        // If no existing window is found, or focus is not supported, open a new one.
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

// Updated fetch handler
self.addEventListener("fetch", (event) => {
  // If the request should not be cached, let the browser handle it normally.
  // This means the service worker will not intercept this request.
  if (!shouldCache(event.request.url)) {
    // console.log('Fetch event for non-cacheable URL, skipping SW:', event.request.url);
    return;
  }
  
  // For cacheable requests, use a cache-first strategy.
  event.respondWith(
    (async () => {
      // Try to get the response from the cache.
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        // console.log('Serving from cache:', event.request.url);
        return cachedResponse;
      }
      
      // If not in cache, fetch from the network.
      try {
        // console.log('Fetching from network:', event.request.url);
        const networkResponse = await fetch(event.request);
        
        // Cache the fetched response if it's a successful GET request.
        // The request.method check is important as non-GET requests usually shouldn't be cached.
        if (networkResponse.ok && event.request.method === 'GET') {
          const cache = await caches.open(CACHE_NAME);
          // console.log('Caching new resource:', event.request.url);
          // It's crucial to clone the response before putting it in the cache,
          // as the response body can only be consumed once.
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        console.error('Fetch failed; returning offline page or error:', error);
        // Optionally, you could return a fallback offline page here:
        // return caches.match('/offline.html'); // Ensure '/offline.html' is in RESOURCES_TO_CACHE
        // For now, just rethrow the error, which will likely result in a browser network error page.
        throw error;
      }
    })()
  );
});

// Helper function to check if a client is focused (not used in current logic but kept)
async function isClientFocused() {
  const windowClients = await clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  return windowClients.some((client) => client.focused);
}

// Periodic sync for keeping the service worker alive (browser support and behavior varies)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "keep-alive") {
    console.log("Periodic sync event 'keep-alive' received.");
    event.waitUntil(
      // Perform a minimal task to keep service worker active, e.g., a health check or no-op.
      Promise.resolve().then(() => console.log("Keep-alive task executed."))
    );
  }
});