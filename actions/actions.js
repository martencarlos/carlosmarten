"use server";

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "@lib/aws-config";
import { sendNotifications } from "./pushNotifications";

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
// Update the fetchWordPressPage function in actions/actions.js
export async function fetchWordPressPage(slug) {
  const wpUrl = `https://${process.env.NEXT_PUBLIC_WP_URL}/${slug}`;

  const response = await fetch(wpUrl, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
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
  //security check
  const secret = formData.get("secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    throw new Error("Unauthorized webhook request");
  }
  console.log("secret checks out")
  //extract of data
  const postData = {
    slug: formData.get("slug"),
    title: formData.get("title"),
    content: formData.get("content"),
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/posts/${formData.get("slug")}`,
  };

  console.log("data extracted:")
  console.log(postData)

  // Send notifications to all subscribers
  await sendNotifications(postData);
    revalidatePath(`/posts/${postData.slug}`);
    revalidatePath('/'); // Revalidate home page
    revalidatePath('/blog'); // Revalidate blog list page
  
}