// public/sw.js

// Cache name for offline support - update version to force refresh
const CACHE_NAME = "carlosmarten-v3"; // <-- INCREMENTED VERSION

// Resources to cache
const RESOURCES_TO_CACHE = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/favicon-32x32.png",
  // Add any other core static assets that make up your app shell.
  // If you have an offline.html, add it here too.
  // '/offline.html',
];

// This value needs to be set, ideally by your build process.
// It should be the HOSTNAME of your WordPress instance.
const CONFIGURED_WP_HOSTNAME = "wdp.carlosmarten.com"; // E.g., "wdp.carlosmarten.com"

// Helper function to check if a URL should be cached
function shouldCache(url) {
  const urlObj = new URL(url);

  // 1. Skip WordPress API paths (e.g., /wp-json/*)
  if (urlObj.pathname.includes('/wp-json/')) {
    // console.log(`[SW shouldCache] NO_CACHE (WP API): ${url}`);
    return false;
  }

  // 2. Skip requests TO the configured WordPress hostname
  // This is to avoid caching API responses or dynamic content directly from WP
  // that should always be fresh from the network.
  if (CONFIGURED_WP_HOSTNAME && urlObj.hostname === CONFIGURED_WP_HOSTNAME) {
    // console.log(`[SW shouldCache] NO_CACHE (Configured WP Host): ${url}`);
    return false;
  }

  // 3. Skip Next.js dynamic data routes (e.g., /_next/data/BUILD_ID/page.json)
  if (urlObj.pathname.startsWith('/_next/data/')) {
    // console.log(`[SW shouldCache] NO_CACHE (Next.js data): ${url}`);
    return false;
  }

  // Add other specific exclusions if needed:
  // if (urlObj.pathname.startsWith('/api/')) { // Example: your own backend APIs
  //   return false;
  // }

  // console.log(`[SW shouldCache] CACHE: ${url}`);
  return true;
}

self.addEventListener("install", (event) => {
  console.log(`[SW] Event: install (v: ${CACHE_NAME})`);
  // Force waiting Service Worker to become active
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching app shell resources:", RESOURCES_TO_CACHE);
      return cache.addAll(RESOURCES_TO_CACHE);
    }).catch(error => {
      console.error("[SW] Failed to cache app shell resources during install:", error);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log(`[SW] Event: activate (v: ${CACHE_NAME})`);
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
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      }),
    ]).then(() => console.log("[SW] Activated and old caches cleaned."))
      .catch(error => console.error("[SW] Activation or old cache cleanup failed:", error))
  );
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // If the request should not be cached, let the browser handle it normally (network-only).
  if (!shouldCache(url)) {
    // console.log('[SW] Fetch event for non-cacheable URL, passing through:', url);
    return; // Let the browser handle it, SW does not intercept.
  }

  // For cacheable requests, use a cache-first strategy.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);

      if (cachedResponse) {
        // console.log('[SW] Serving from cache:', url);
        return cachedResponse;
      }

      // console.log('[SW] Fetching from network (and caching):', url);
      try {
        const networkResponse = await fetch(event.request);

        // Cache the fetched response if it's a successful GET request and cacheable.
        // Note: shouldCache has already filtered non-cacheable URLs at the top.
        if (networkResponse && networkResponse.ok && event.request.method === 'GET') {
          // console.log('[SW] Caching new resource:', url);
          // It's crucial to clone the response before putting it in the cache and returning it,
          // as the response body can only be consumed once.
          await cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        console.error('[SW] Fetch failed; network error for:', url, error);
        // Optionally, return a fallback offline page here if one is cached:
        // const offlinePage = await caches.match('/offline.html');
        // if (offlinePage) return offlinePage;
        throw error; // Propagate the error to the browser
      }
    })()
  );
});


self.addEventListener("push", (event) => {
  console.log("[SW] Push event received:", event);

  if (event.data) {
    try {
      const data = event.data.json();
      console.log("[SW] Push data:", data);

      const options = {
        body: data.body || "New content available.",
        icon: data.icon || "/android-chrome-192x192.png",
        badge: data.badge || "/favicon-32x32.png",
        vibrate: data.vibrate || [100, 50, 100],
        tag: data.tag || "general-notification",
        renotify: typeof data.renotify === 'boolean' ? data.renotify : true,
        data: {
          url: data.url || "/", // URL to open on click
          // Store the URL in both places for compatibility
          openUrl: data.url || "/",
          origin: self.registration.scope,
          ...data.data // Allow any other custom data
        },
      };

      event.waitUntil(
        self.registration
          .showNotification(data.title || "New Notification", options)
          .then(() => console.log("[SW] Notification shown successfully"))
          .catch((error) => {
            console.error("[SW] Error showing notification:", error);
            // Fallback to basic notification if advanced options fail
            return self.registration.showNotification(data.title || "New Notification", {
              body: data.body || "New content available.",
              icon: "/android-chrome-192x192.png",
              data: { url: data.url || "/" },
            });
          })
      );
    } catch (error) {
      console.error("[SW] Error processing push data:", error);
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
  } else {
    console.log("[SW] Push event received with no data.");
  }
});

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click received:", event.notification);
  event.notification.close();

  if (event.action === "close") { // If you add actions to notifications
    console.log("[SW] Notification action: close");
    return;
  }

  const urlToOpen = new URL(
    event.notification.data.url || event.notification.data.openUrl || "/", // Check both common data properties
    self.registration.scope // Base URL for relative paths
  ).href;

  console.log("[SW] Attempting to open URL:", urlToOpen);

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          // If a window with the target URL already exists, focus it.
          // Check client.url (actual URL) and if it has focus method
          if (client.url === urlToOpen && "focus" in client) {
            console.log("[SW] Found existing client, focusing:", client.url);
            return client.focus();
          }
        }
        // If no existing window is found, or focus is not supported, open a new one.
        if (clients.openWindow) {
          console.log("[SW] No existing client found, opening new window:", urlToOpen);
          return clients.openWindow(urlToOpen);
        }
        console.log("[SW] Could not open window, clients.openWindow is not available.");
      }).catch(error => {
        console.error("[SW] Error handling notification click:", error);
        // Fallback: try opening the window if the complex logic failed
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification);
  // You can add analytics or other logic here if needed
});

// Periodic sync (optional, limited support)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "keep-alive") {
    console.log("[SW] Periodic sync event 'keep-alive' received.");
    event.waitUntil(
      Promise.resolve().then(() => console.log("[SW] Keep-alive task executed."))
    );
  }
});

// Helper function to check if a client is focused (not used in current logic but kept if you need it)
async function isClientFocused() {
  const windowClients = await clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  return windowClients.some((client) => client.focused);
}