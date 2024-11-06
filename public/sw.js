//https://whatpwacando.today/ - PWA features

self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/android-chrome-192x192.png",
      badge: "/favicon-32x32.png",
      vibrate: [100, 50, 100],
      data: {
        url: data.url, // Store the URL for later use
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // Navigate to the post URL when notification is clicked
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
