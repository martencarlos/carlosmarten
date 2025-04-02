import { handlePostWebhook } from "@actions/actions";

export async function POST(request) {
  console.log("received request from wordpress to send notification")
  const formData = await request.formData();
  
  console.log("here is the info received:")
  console.log(formData)
  try {
    await handlePostWebhook(formData);
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
