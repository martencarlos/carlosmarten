import { supabase } from "@lib/supabaseClient";

export async function GET() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
    });
  }
  return new Response(JSON.stringify({ session }), { status: 200 });
}

export async function POST(request) {
  const { email, password } = await request.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
    });
  }
  return new Response(JSON.stringify({ message: "Logged out successfully" }), {
    status: 200,
  });
}
