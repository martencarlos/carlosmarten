// public/sw.js
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();

    // More detailed options for mobile notifications
    const options = {
      body: data.body,
      icon: "/android-chrome-192x192.png", // Make sure this icon exists
      badge: "/favicon-32x32.png", // This is shown in Android notifications bar
      vibrate: [200, 100, 200], // Vibration pattern
      tag: "blog-notification", // For notification grouping
      renotify: true, // Show each notification separately even with same tag
      data: {
        url: data.url,
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
      // Android specific options
      requireInteraction: true, // Notification won't auto dismiss on Android
      silent: false, // Will make sound/vibrate
    };

    // Log for debugging
    console.log("Push event received:", data);

    event.waitUntil(
      self.registration
        .showNotification(data.title, options)
        .then(() => {
          console.log("Notification shown successfully");
        })
        .catch((error) => {
          console.error("Error showing notification:", error);
        })
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification clicked:", event.notification.data);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Handle notification click (both default click and 'open' action)
  event.waitUntil(
    clients
      .matchAll({ type: "window" })
      .then(function (clientList) {
        // If a window tab is already open, focus it
        for (let client of clientList) {
          if (client.url === event.notification.data.url && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
      .catch((error) => {
        console.error("Error handling notification click:", error);
      })
  );
});

// Handle notification close event
self.addEventListener("notificationclose", function (event) {
  console.log("Notification closed:", event.notification.data);
});
