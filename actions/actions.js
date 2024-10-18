"use server";

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

export async function addContact(formData) {
  const { name, email, message } = Object.fromEntries(formData.entries());

  await sql`
      INSERT INTO contacts (name, email, message)
      VALUES (${name}, ${email}, ${message})
    `;
  revalidatePath("/contact");
}

export async function fetchWordPressPage(slug) {
  // Construct the URL to fetch the page from WordPress
  const wpUrl = `https://${process.env.NEXT_PUBLIC_WP_URL}/${slug}`;

  // Fetch the content from the WordPress site
  const response = await fetch(wpUrl, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    next: { cache: "no-store" }, // This disables caching
  });

  if (!response.ok) {
    console.error("Error fetching WordPress content:", response.status);
    return null;
  }

  // Return the HTML content
  const html = await response.text();
  return html;
}
