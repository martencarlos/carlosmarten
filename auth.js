import NextAuth from "next-auth";
import Github from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Github],
  pages: {
    signIn: "/login",
    error: "/unauthorized",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // restricted to admin users
      const allowedEmail = process.env.AUTH_ADMIN_EMAIL;

      if (user.email === allowedEmail) {
        return true; // Allow sign-in
      }
      return "/unauthorized"; // Reject all other users
    },
  },
});
