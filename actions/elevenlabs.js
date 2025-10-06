"use server";

// This function now calls your external Express server
export async function generateAndUploadAudio(postId, title, content) {
  const expressServerUrl = process.env.EXPRESS_SERVER_URL;

  if (!expressServerUrl) {
    console.error("EXPRESS_SERVER_URL environment variable is not set.");
    return { success: false, error: "Audio processing service is not configured." };
  }

  try {
    const response = await fetch(`${expressServerUrl}/generate-and-upload-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId, title, content }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to offload audio processing.");
    }

    const result = await response.json();
    return { success: true, audioUrl: result.audioUrl };

  } catch (error) {
    console.error("Error in generateAndUploadAudio:", error.message);
    return { success: false, error: error.message };
  }
}