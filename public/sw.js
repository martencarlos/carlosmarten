// public/sw.js

// IMPORTANT: Increment this version number whenever you make changes to your site
// This forces the service worker to update and clear old caches
const CACHE_VERSION = "v5"; // <-- INCREMENT THIS WHEN YOU DEPLOY CHANGES
const CACHE_NAME = `carlosmarten-${CACHE_VERSION}`;

// Resources to cache for offline support (only truly static assets)
const RESOURCES_TO_CACHE = [
  "/manifest.json",
  "/favicon.ico",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/favicon-32x32.png",
];

const CONFIGURED_WP_HOSTNAME = "wdp.carlosmarten.com";

// Helper function to check if a URL should be cached
function shouldCache(url) {
  const urlObj = new URL(url);

  // Skip WordPress API paths
  if (urlObj.pathname.includes('/wp-json/')) {
    return false;
  }

  // Skip WordPress hostname
  if (CONFIGURED_WP_HOSTNAME && urlObj.hostname === CONFIGURED_WP_HOSTNAME) {
    return false;
  }

  // Skip Next.js dynamic data routes
  if (urlObj.pathname.startsWith('/_next/data/')) {
    return false;
  }

  // Skip Next.js build files (they have their own caching)
  if (urlObj.pathname.startsWith('/_next/static/')) {
    return false;
  }

  // Skip API routes
  if (urlObj.pathname.startsWith('/api/')) {
    return false;
  }

  // Skip HTML pages - they should always be fresh
  if (urlObj.pathname.endsWith('.html') || 
      urlObj.pathname === '/' || 
      !urlObj.pathname.includes('.')) {
    return false;
  }

  return true;
}

self.addEventListener("install", (event) => {
  console.log(`[SW] Installing new service worker (${CACHE_NAME})`);
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching core app shell resources");
        return cache.addAll(RESOURCES_TO_CACHE);
      })
      .catch(error => {
        console.error("[SW] Failed to cache app shell during install:", error);
      })
  );
});

self.addEventListener("activate", (event) => {
  console.log(`[SW] Activating new service worker (${CACHE_NAME})`);
  
  event.waitUntil(
    Promise.all([
      // Take control of all pages immediately
      self.clients.claim(),
      
      // Delete all old caches
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
    ])
    .then(() => {
      console.log("[SW] Activated and old caches cleaned");
      // Notify all clients that the service worker has been updated
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION
          });
        });
      });
    })
    .catch(error => console.error("[SW] Activation failed:", error))
  );
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Network-first strategy for HTML and dynamic content
  if (event.request.mode === 'navigate' || 
      event.request.destination === 'document' ||
      !shouldCache(url)) {
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Don't cache the response, just return it
          return response;
        })
        .catch(error => {
          console.error('[SW] Network request failed:', url, error);
          // Return cached version only if network fails (offline fallback)
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-first strategy only for truly static assets
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Check if cache is stale (older than 1 hour)
          const cacheDate = new Date(cachedResponse.headers.get('date'));
          const now = new Date();
          const hoursSinceCached = (now - cacheDate) / (1000 * 60 * 60);
          
          if (hoursSinceCached > 1) {
            // Cache is stale, fetch fresh version in background
            fetch(event.request)
              .then(response => {
                if (response && response.ok && event.request.method === 'GET') {
                  caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, response.clone());
                  });
                }
              })
              .catch(() => {
                // Ignore fetch errors when updating cache
              });
          }
          
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(event.request)
          .then(response => {
            if (response && response.ok && event.request.method === 'GET') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          });
      })
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
          url: data.url || "/",
          openUrl: data.url || "/",
          origin: self.registration.scope,
          ...data.data
        },
      };

      event.waitUntil(
        self.registration
          .showNotification(data.title || "New Notification", options)
          .then(() => console.log("[SW] Notification shown successfully"))
          .catch((error) => {
            console.error("[SW] Error showing notification:", error);
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
  }
});

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click received:", event.notification);
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const urlToOpen = new URL(
    event.notification.data.url || event.notification.data.openUrl || "/",
    self.registration.scope
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
          if (client.url === urlToOpen && "focus" in client) {
            console.log("[SW] Found existing client, focusing:", client.url);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          console.log("[SW] Opening new window:", urlToOpen);
          return clients.openWindow(urlToOpen);
        }
      })
      .catch(error => {
        console.error("[SW] Error handling notification click:", error);
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification);
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            console.log("[SW] Clearing cache:", name);
            return caches.delete(name);
          })
        );
      })
    );
  }
});