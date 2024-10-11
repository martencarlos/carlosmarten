import LoginForm from "@components/private/LoginForm/LoginForm";
import { supabase } from "@lib/supabaseClient";

export default function Login() {
  const session = supabase.auth.session();

  return (
    <div>
      <LoginForm />
    </div>
  );
}
