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
