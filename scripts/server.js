// server.js
// This Express server offloads audio generation from a Vercel function.
// It responds immediately to prevent timeouts and processes tasks in the background.

import express from 'express';
import multer from 'multer';
import pg from 'pg'; // Use the standard 'pg' library for external connections
import FormData from 'form-data';
import fetch from 'node-fetch';
import 'dotenv/config'; // Loads variables from .env file into process.env

// --- PostgreSQL Pool Configuration ---
// The Pool manages multiple client connections.
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  // Vercel Postgres requires SSL for all external connections.
  ssl: {
    rejectUnauthorized: false,
  },
});


const app = express();
const upload = multer();

// Middleware to parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- THE MAIN ROUTE ---
app.post('/generate-and-upload-audio', upload.none(), (req, res) => {
  const { postId, title, content } = req.body;

  // 1. Basic validation
  if (!postId || !title || !content) {
    return res.status(400).json({ success: false, error: 'Missing required fields: postId, title, or content.' });
  }

  // 2. Respond to Vercel IMMEDIATELY to prevent a timeout.
  // We use status 202 Accepted, which means "The request has been accepted for processing, but the processing has not been completed."
  console.log(`[Post ${postId}] Request received. Responding 202 Accepted and starting background job.`);
  res.status(202).json({ success: true, message: 'Audio processing accepted and started in the background.' });

  // 3. Start the long-running task in the background.
  // We wrap it in an immediately-invoked async function.
  (async () => {
    try {
      console.log(`[Post ${postId}] Step 1/3: Generating audio from ElevenLabs...`);
      const audioBuffer = await generateAudio(content);

      console.log(`[Post ${postId}] Step 2/3: Uploading audio to WordPress...`);
      const wordpressMedia = await uploadAudioToWordPress(audioBuffer, title, postId);

      console.log(`[Post ${postId}] Step 3/3: Updating database with audio URL...`);
      const queryText = `
        INSERT INTO posts (id, audio_url)
        VALUES ($1, $2)
        ON CONFLICT (id)
        DO UPDATE SET audio_url = $2;
      `;
      await pool.query(queryText, [postId, wordpressMedia.source_url]);

      console.log(`[Post ${postId}] SUCCESS: Background job finished. Audio URL is ${wordpressMedia.source_url}`);

    } catch (error) {
      // Since the response to Vercel has already been sent, we can only log errors here.
      // These logs can be viewed with `pm2 logs audio-server`.
      console.error(`[Post ${postId}] BACKGROUND JOB FAILED: ${error.message}`);
      console.error(error); // Log the full error object for more details
    }
  })();
});


// --- HELPER FUNCTIONS (No changes needed below) ---

async function generateAudio(text) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    // Log the detailed error from the API for better debugging
    console.error("ElevenLabs API error:", errorData);
    throw new Error("Failed to generate audio");
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
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

// --- START THE SERVER ---
const PORT = process.env.PORT || 3001;
// Listen on '0.0.0.0' to be accessible from outside the LXC container
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Audio processing server is running on http://0.0.0.0:${PORT}`);
});
