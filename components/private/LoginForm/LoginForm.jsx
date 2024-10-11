"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./page.module.css";

export default function LoginForm() {
  console.log("LoginForm loaded");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      router.push("/dashboard");
    } else {
      const { error } = await response.json();
      setErrorMessage(error); // Set the error message to display
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleLogin}>
        <div>
          <label className={styles.label}>Email:</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={styles.label}>Password:</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className={styles.button} type="submit">
          Login
        </button>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}{" "}
        {/* Display error message if any */}
      </form>
    </div>
  );
}
