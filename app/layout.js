import { ThemeProvider } from 'next-themes';
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/Navbar/Navbar";



const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export const metadata = {
  title: 'Carlos Marten',
  description: "Technology meets business",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  WebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Carlos Marten',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({ children }) {
  return (
      <html lang="en" suppressHydrationWarning>
      
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider attribute="class">
          <Navbar />
          {children}
          </ThemeProvider>
        </body>
       
      </html>
  );
}
