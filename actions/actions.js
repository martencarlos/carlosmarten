"use server";

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "@lib/aws-config";

//PUSH NOTIFICATIONS
// import webpush from "web-push";
// import { cookies } from "next/headers";

// Initialize web-push with your VAPID keys
// webpush.setVapidDetails(
//   "mailto:your-email@example.com",
//   process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
//   process.env.VAPID_PRIVATE_KEY
// );

// In-memory storage (replace with your database in production)
// let subscriptions = new Map();

//subscribe user
// export async function subscribeUser(subscription) {
//   const userId = cookies().get("userId")?.value || "anonymous";
//   subscriptions.set(userId, subscription);
//   return { success: true };
// }

//unsubscribe user
// export async function unsubscribeUser() {
//   const userId = cookies().get("userId")?.value || "anonymous";
//   subscriptions.delete(userId);
//   return { success: true };
// }

//CONTACT PAGE - ADD CONTACT
export async function addContact(formData) {
  const { name, email, message } = Object.fromEntries(formData.entries());

  await sql`
      INSERT INTO contacts (name, email, message)
      VALUES (${name}, ${email}, ${message})
    `;
  revalidatePath("/contact");
}

const dynamic = "force-dynamic";

//WORDPRESS PAGE PROJECT - FETCH WORDPRESS PAGE
export async function fetchWordPressPage(slug) {
  const wpUrl = `https://${
    process.env.NEXT_PUBLIC_WP_URL
  }/${slug}?t=${new Date().getTime()}`; // Cache busting with timestamp

  const response = await fetch(wpUrl, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    console.error("Error fetching WordPress content:", response.status);
    return null;
  }

  const html = await response.text();
  return html;
}

//POST WEBHOOK - HANDLE POST WEBHOOK
export async function handlePostWebhook(formData) {
  const secret = formData.get("secret");

  if (secret !== process.env.WEBHOOK_SECRET) {
    throw new Error("Unauthorized");
  }

  // if (!secret) {
  //   console.error("No secret provided");
  //   return NextResponse.json({ error: "No secret provided" }, { status: 400 });
  // }

  const postData = {
    id: formData.get("id"),
    title: formData.get("title"),
    content: formData.get("content"),
  };

  // Send notification to all subscribed users
  // const notifications = Array.from(subscriptions.values()).map(
  //   (subscription) => {
  //     return webpush
  //       .sendNotification(
  //         subscription,
  //         JSON.stringify({
  //           title: `New Post: ${title}`,
  //           body: "excerpt",
  //           url: url,
  //           icon: "/icon.png",
  //         })
  //       )
  //       .catch((err) => {
  //         console.error("Error sending notification:", err);
  //         // If subscription is invalid, remove it
  //         if (err.statusCode === 410) {
  //           const userId = [...subscriptions.entries()].find(
  //             ([_, sub]) => sub === subscription
  //           )?.[0];
  //           if (userId) subscriptions.delete(userId);
  //         }
  //       });
  //   }
  // );

  // await Promise.all(notifications);

  // Send message to SQS queue
  try {
    const command = new SendMessageCommand({
      QueueUrl: process.env.AWS_SQS_QUEUE_URL,
      MessageBody: JSON.stringify(postData),
    });

    await sqsClient.send(command);

    // Revalidate the post page
    revalidatePath(`/posts/${postData.id}`);

    return { success: true, message: "Audio generation queued" };
  } catch (error) {
    console.error("Error queuing message:", error);
    throw error;
  }
}
