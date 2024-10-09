import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Roboto } from 'next/font/google'

import Navbar from "./components/Navbar/Navbar";
import Footer from "@components/Footer/Footer";

// Initialize the font
const roboto = Roboto({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})


export const metadata = {
  title: "Carlos Marten",
  description: "Technology meets business",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  WebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Carlos Marten",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }) {
  console.log("RootLayout loaded");
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={roboto.className}>
        <ThemeProvider attribute="class">
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
