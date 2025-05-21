import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@providers/theme-provider";
import "./globals.css";


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
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <ThemeProvider>
     
            {children}
         
  
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
