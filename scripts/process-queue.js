import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";
import fetch from "node-fetch";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

// Helper function to generate slug from the title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .trim();
}

async function generateAudio(text) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
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
    throw new Error(`Failed to generate audio: ${await response.text()}`);
  }

  return response.arrayBuffer();
}

async function uploadToS3(buffer, slug) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `audio/${slug}.mp3`, // Using slug in the S3 key
    Body: Buffer.from(buffer),
    ContentType: "audio/mpeg",
  });

  await s3Client.send(command);
}

export const handler = async (event) => {
  console.log("Processing messages:", JSON.stringify(event));

  const results = [];

  for (const record of event.Records) {
    try {
      const postData = JSON.parse(record.body);
      console.log("Processing post:", postData.title);

      const text = `${postData.title}. ${postData.content}`;
      const slug = generateSlug(postData.title);

      // Generate audio
      const audioBuffer = await generateAudio(text);
      console.log("Audio generated for post:", slug);

      // Upload to S3
      await uploadToS3(audioBuffer, slug);
      console.log("Audio uploaded for post:", slug);

      console.log(`Successfully processed post ${slug}`);
      results.push({
        postSlug: slug,
        status: "success",
      });
    } catch (error) {
      console.error("Error processing message:", error);
      results.push({
        postSlug: generateSlug(JSON.parse(record.body).title),
        status: "error",
        error: error.message,
      });
      throw error; // This will cause Lambda to retry the message
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(results),
  };
};
