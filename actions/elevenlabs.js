'use server';

import {sql} from '@vercel/postgres';
import FormData from 'form-data';

async function generateAudio (text) {
  const response = await fetch (
    `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify ({
        text,
        model_id: `${process.env.ELEVENLABS_MODEL_ID}`,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json ();
    console.error ('ElevenLabs API error:', errorData);
    throw new Error ('Failed to generate audio');
  }

  return response.body;
}

async function uploadAudioToWordPress (audioStream, title, postId) {
  const wpUrl = `https://${process.env.NEXT_PUBLIC_WP_URL}/wp-json/wp/v2/media`;
  const wpUser = process.env.WP_USER;
  const wpPassword = process.env.WP_PASSWORD;

  const form = new FormData ();
  form.append ('file', audioStream, {
    filename: `${title}.mp3`,
    contentType: 'audio/mpeg',
  });
  form.append ('title', `${title} Audio`);
  form.append ('post', postId);

  const response = await fetch (wpUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa (`${wpUser}:${wpPassword}`)}`,
      ...form.getHeaders (),
    },
    body: form,
  });

  if (!response.ok) {
    const errorData = await response.json ();
    console.error ('WordPress API error:', errorData);
    throw new Error ('Failed to upload audio to WordPress');
  }

  return response.json ();
}

export async function generateAndUploadAudio (postId, title, content) {
  try {
    const audioStream = await generateAudio (content);
    const wordpressMedia = await uploadAudioToWordPress (
      audioStream,
      title,
      postId
    );

    // Store the audio URL in your database
    await sql`
      UPDATE posts
      SET audio_url = ${wordpressMedia.source_url}
      WHERE id = ${postId}
    `;

    return {success: true, audioUrl: wordpressMedia.source_url};
  } catch (error) {
    console.error ('Error in generateAndUploadAudio:', error);
    return {success: false, error: error.message};
  }
}
