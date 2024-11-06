"use server";

import { sql } from "@vercel/postgres";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:martencarlos@gmail.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Subscribe user
export async function subscribeUser(subscription) {
  try {
    await sql`
      INSERT INTO push_subscriptions (
        endpoint,
        p256dh,
        auth
      ) VALUES (
        ${subscription.endpoint},
        ${subscription.keys.p256dh},
        ${subscription.keys.auth}
      )
      ON CONFLICT (endpoint) 
      DO UPDATE SET 
        p256dh = ${subscription.keys.p256dh},
        auth = ${subscription.keys.auth}
    `;

    return { success: true };
  } catch (error) {
    console.error("Subscription error:", error);
    throw new Error("Failed to subscribe to notifications");
  }
}

// Unsubscribe user
export async function unsubscribeUser(subscription) {
  try {
    await sql`
      DELETE FROM push_subscriptions 
      WHERE endpoint = ${subscription.endpoint}
    `;

    return { success: true };
  } catch (error) {
    console.error("Unsubscription error:", error);
    throw new Error("Failed to unsubscribe from notifications");
  }
}

// Send notification (used in webhook handler)
export async function sendNotifications(postData) {
  try {
    const { rows: subscriptions } = await sql`
      SELECT endpoint, p256dh, auth 
      FROM push_subscriptions
    `;

    const notifications = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({
            title: `New Post: ${postData.title}`,
            body: postData.content.substring(0, 100) + "...",
            url: `/posts/${postData.id}`,
          })
        );
      } catch (error) {
        if (error.statusCode === 410) {
          // Remove invalid subscription
          await sql`
            DELETE FROM push_subscriptions 
            WHERE endpoint = ${sub.endpoint}
          `;
        }
        console.error("Error sending notification:", error);
      }
    });

    await Promise.all(notifications);
    return { success: true };
  } catch (error) {
    console.error("Error sending notifications:", error);
    throw new Error("Failed to send notifications");
  }
}

export async function sendTestNotification(data) {
  try {
    const { rows: subscriptions } = await sql`
      SELECT endpoint, p256dh, auth 
      FROM push_subscriptions
    `;

    if (subscriptions.length === 0) {
      return {
        success: false,
        error:
          "No subscribed users found. Please subscribe to notifications first.",
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const notifications = subscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({
            title: data.title,
            body: data.url,
            url: siteUrl, // Using environment variable instead of window.location
          })
        );
      } catch (error) {
        if (error.statusCode === 410) {
          // Remove invalid subscription
          await sql`
            DELETE FROM push_subscriptions 
            WHERE endpoint = ${sub.endpoint}
          `;
        }
        throw error;
      }
    });

    await Promise.all(notifications);
    return { success: true };
  } catch (error) {
    console.error("Error sending test notification:", error);
    return {
      success: false,
      error: error.message || "Failed to send notification",
    };
  }
}
