import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "next-themes";
import "../globals.css";
import { Roboto } from "next/font/google";

import Navbar from "@components/Navbar/Navbar";
import Footer from "@components/Footer/Footer";

import { AudioProvider } from "@context/AudioContext";
import GlobalAudioPlayer from "@components/Article/AudioPlayer/GlobalAudioPlayer";

// Initialize the font
const roboto = Roboto({
  display: "swap",
  preload: true,
  weight: ["400", "500", "700"],
  style: ["normal"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Carlos Marten",
  description: "Technology meets business",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
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
          <AudioProvider>
            <Navbar />
            {children}
            <Footer />
            <GlobalAudioPlayer />
          </AudioProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
