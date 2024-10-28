import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { sqsClient, s3Client } from "../lib/aws-config";

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
    throw new Error("Failed to generate audio");
  }

  return response.arrayBuffer();
}

async function uploadToS3(buffer, postId) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `audio/${postId}.mp3`,
    Body: Buffer.from(buffer),
    ContentType: "audio/mpeg",
  });

  await s3Client.send(command);
}

async function processMessage(message) {
  try {
    const postData = JSON.parse(message.Body);
    const text = `${postData.title}. ${postData.content}`;

    // Generate audio
    const audioBuffer = await generateAudio(text);

    // Upload to S3
    await uploadToS3(audioBuffer, postData.id);

    // Delete message from queue
    const deleteCommand = new DeleteMessageCommand({
      QueueUrl: process.env.AWS_SQS_QUEUE_URL,
      ReceiptHandle: message.ReceiptHandle,
    });
    await sqsClient.send(deleteCommand);

    // Trigger revalidation
    await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate?path=/posts/${postData.id}&secret=${process.env.REVALIDATION_SECRET}`
    );

    console.log(`Processed audio for post ${postData.id}`);
  } catch (error) {
    console.error("Error processing message:", error);
    // Message will automatically return to queue after visibility timeout
  }
}

async function pollQueue() {
  while (true) {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: process.env.AWS_SQS_QUEUE_URL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20, // Long polling
      });

      const response = await sqsClient.send(command);

      if (response.Messages) {
        for (const message of response.Messages) {
          await processMessage(message);
        }
      }
    } catch (error) {
      console.error("Error polling queue:", error);
      // Wait before retrying on error
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

// Start processing
pollQueue();
