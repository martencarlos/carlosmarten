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
  const response = await fetch(wpUrl);

  if (!response.ok) {
    console.error("Error fetching WordPress content:", response.status);
    return null;
  }

  // Return the HTML content
  const html = await response.text();
  return html;
}
