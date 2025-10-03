"use server";

import { sql } from "@vercel/postgres";
import FormData from "form-data";

async function generateAudio(text) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("ElevenLabs API error:", errorData);
    throw new Error("Failed to generate audio");
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer;
}

async function uploadAudioToWordPress(audioBuffer, title, postId) {
  const wpUrl = `https://${process.env.NEXT_PUBLIC_WP_URL}/wp-json/wp/v2/media`;
  const wpUser = process.env.WP_USER;
  const wpPassword = process.env.WP_PASSWORD;

  const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  const form = new FormData();
  form.append("file", audioBuffer, {
    filename: `${sanitizedTitle}.mp3`,
    contentType: "audio/mpeg",
  });
  form.append("title", `${title} Audio`);
  form.append("post", postId);

  const response = await fetch(wpUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${wpUser}:${wpPassword}`).toString('base64')}`,
      // This is the crucial fix: The form-data library generates the
      // necessary Content-Type header with the multipart boundary.
      ...form.getHeaders(),
    },
    body: form,
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("WordPress API error:", errorData);
    throw new Error("Failed to upload audio to WordPress");
  }

  return response.json();
}

export async function generateAndUploadAudio(postId, title, content) {
  try {
    const audioBuffer = await generateAudio(content);
    const wordpressMedia = await uploadAudioToWordPress(
      audioBuffer,
      title,
      postId
    );

    await sql`
      INSERT INTO posts (id, audio_url)
      VALUES (${postId}, ${wordpressMedia.source_url})
      ON CONFLICT (id)
      DO UPDATE SET audio_url = ${wordpressMedia.source_url};
    `;

    return { success: true, audioUrl: wordpressMedia.source_url };
  } catch (error) {
    console.error("Error in generateAndUploadAudio:", error.message);
    return { success: false, error: error.message };
  }
}