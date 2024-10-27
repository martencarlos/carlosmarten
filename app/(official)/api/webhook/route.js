import { generateAudioForPost } from "@actions/actions";

export async function POST(request) {
  const formData = await request.formData();

  try {
    await generateAudioForPost(formData);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
