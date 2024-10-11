import { redirect } from "next/navigation";
import { supabase } from "@lib/supabaseClient";

import styles from "./page.module.css";

export default async function LoginForm() {
  console.log("LoginForm loaded");

  // Handle form submission
  async function handleLogin(formData) {
    "use server"; // Mark this function as a server action

    // Retrieve form fields from FormData
    const email = formData.get("email");
    const password = formData.get("password");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("Error logging in:", error.message);
    } else {
      // On success, redirect to the dashboard
      console.log("Login successful: ");
      redirect("/dashboard");
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} action={handleLogin}>
        <div>
          <input
            className={styles.input}
            name="email"
            placeholder="email"
            required
          />
        </div>
        <div>
          <input
            className={styles.input}
            name="password"
            type="password"
            placeholder="password"
            required
          />
        </div>
        <button className={styles.button} type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
