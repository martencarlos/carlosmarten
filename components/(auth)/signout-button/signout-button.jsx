"use client";
import { signOut } from "next-auth/react";

// Allow the button to accept a className and children for more flexible styling and content
export default function SignOutButton({ className, children }) {
  return (
    <button
      className={className}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      {children ? children : "Sign Out"}
    </button>
  );
}