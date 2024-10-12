import LoginForm from "@components/private/LoginForm/LoginForm";
import { supabase } from "@lib/supabaseClient";
import { redirect } from "next/navigation";

export default async function Login() {
  const session = await supabase.auth.getSession();
  console.log(session.data.session);
  if (session.data.session !== null) {
    redirect("/dashboard");
  }

  return (
    <div>
      <LoginForm />
    </div>
  );
}
