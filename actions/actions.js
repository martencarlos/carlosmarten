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
