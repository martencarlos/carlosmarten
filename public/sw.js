// public/sw.js
self.addEventListener("push", function (event) {
  console.log("Push event received in SW");

  if (event.data) {
    try {
      const data = event.data.json();
      console.log("Push data:", data);

      // More detailed options for mobile notifications
      const options = {
        body: data.body,
        icon: "/android-chrome-192x192.png",
        badge: "/favicon-32x32.png",
        vibrate: [100, 50, 100],
        tag: "blog-notification",
        renotify: true,
        data: {
          url: data.url || "/",
          time: new Date().getTime(),
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
        // Android specific options
        requireInteraction: true,
        silent: false,
        timestamp: Date.now(),
        // Make sure there's a default click action
        data: {
          onActionClick: {
            default: { url: data.url || "/" },
            open: { url: data.url || "/" },
          },
        },
      };

      // Log for debugging
      console.log("Showing notification with options:", options);

      event.waitUntil(
        self.registration
          .showNotification(data.title, options)
          .then(() => {
            console.log("Notification shown successfully");
          })
          .catch((error) => {
            console.error("Error showing notification:", error);
            // Try showing a simpler notification as fallback
            return self.registration.showNotification(data.title, {
              body: data.body,
              icon: "/android-chrome-192x192.png",
            });
          })
      );
    } catch (error) {
      console.error("Error processing push event:", error);
      // Show a basic notification if JSON parsing fails
      event.waitUntil(
        self.registration.showNotification("New Update", {
          body: event.data.text(),
        })
      );
    }
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification clicked:", event.notification.data);

  // Close the notification
  event.notification.close();

  // Handle the action
  let action = event.action || "default";
  let actionData = event.notification.data.onActionClick[action];
  let url = actionData ? actionData.url : "/";

  if (action === "close") {
    return;
  }

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        // If a window tab is already open, focus it
        for (let client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Force the waiting service worker to become active
self.addEventListener("activate", function (event) {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clear any old caches if needed
      caches.keys().then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            return caches.delete(cacheName);
          })
        );
      }),
    ])
  );
});
