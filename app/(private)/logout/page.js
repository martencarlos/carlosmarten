// app/dashboard/logout.js
import { supabase } from "@lib/supabaseClient";
import { redirect } from "next/navigation";

export default async function Logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log("Error logging out:", error.message);
  } else {
    redirect("/login"); // Redirect to login page
  }
  return null;
}
