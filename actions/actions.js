"use server";

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "@lib/aws-config";

export async function addContact(formData) {
  const { name, email, message } = Object.fromEntries(formData.entries());

  await sql`
      INSERT INTO contacts (name, email, message)
      VALUES (${name}, ${email}, ${message})
    `;
  revalidatePath("/contact");
}

const dynamic = "force-dynamic";

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

export async function handlePostWebhook(formData) {
  const secret = formData.get("secret");

  if (secret !== process.env.WEBHOOK_SECRET) {
    throw new Error("Unauthorized");
  }

  const postData = {
    id: formData.get("id"),
    title: formData.get("title"),
    content: formData.get("content"),
  };

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
