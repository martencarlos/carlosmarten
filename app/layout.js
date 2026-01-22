

import { ThemeProvider } from "@providers/theme-provider";
import CookieConsent from "@components/CookieConsent/CookieConsent";
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
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <CookieConsent gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
      </body>
    </html>
  );
}