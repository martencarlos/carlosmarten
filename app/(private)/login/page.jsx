import LoginForm from "@components/private/LoginForm/LoginForm";
import { supabase } from "@lib/supabaseClient";
import { redirect } from "next/navigation";

export default function Login() {
  const session = supabase.auth.getSession();
  if (session.data.user !== null) {
    redirect("/dashboard");
  }

  return (
    <div>
      <LoginForm />
    </div>
  );
}
