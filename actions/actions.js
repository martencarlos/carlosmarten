"use server";

import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";

import fs from "fs";
import path from "path";

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

export async function generateAudioForPost(formData) {
  const secret = formData.get("secret");
  const postId = formData.get("id");
  const title = formData.get("title");
  const content = formData.get("content");

  // Verify secret key
  if (secret !== process.env.WEBHOOK_SECRET) {
    throw new Error("Unauthorized");
  }

  try {
    const audioUrl = await generateAudio(`${title}. ${content}`, postId);
    revalidatePath(`/posts/${postId}`); // Revalidate the post page
    return { success: true, audioUrl };
  } catch (error) {
    console.error("Error generating audio:", error);
    throw new Error("Failed to generate audio");
  }
}

async function generateAudio(text, postId) {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = "9BWtsMINqrJLrRacOk9x";

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate audio");
  }

  const audioBuffer = await response.arrayBuffer();
  const audioPath = path.join(process.cwd(), "public", "audio");

  // Create directory if it doesn't exist
  if (!fs.existsSync(audioPath)) {
    fs.mkdirSync(audioPath, { recursive: true });
  }

  // Save audio file
  const filePath = path.join(audioPath, `${postId}.mp3`);
  fs.writeFileSync(filePath, Buffer.from(audioBuffer));

  return `/audio/${postId}.mp3`;
}
