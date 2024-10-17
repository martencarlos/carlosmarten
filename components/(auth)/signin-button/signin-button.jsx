"use client";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa";
import styles from "./signin-button.module.css";

export default function SignInButton() {
  return (
    <button
      className={styles.signinbutton}
      onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
    >
      <FaGithub className={styles.icon} /> {/* GitHub Icon */}
      Sign In with GitHub
    </button>
  );
}
