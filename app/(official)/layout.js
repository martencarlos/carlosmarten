"use client";

import Navbar from '@components/Navbar/Navbar';
import Footer from '@components/Footer/Footer';
import { AudioProvider } from '@context/AudioContext';
import GlobalAudioPlayer from '@components/Article/AudioPlayer/GlobalAudioPlayer';
import { usePathname } from 'next/navigation';

export default function OfficialLayout({ children }) {
  console.log('official layout loaded');
  const pathname = usePathname();
  const isDashboardPage = pathname.startsWith('/dashboard');

  return (
    <AudioProvider>
      <div
        className={isDashboardPage ? 'dashboard-active' : ''}
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <Navbar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
        <GlobalAudioPlayer />
        <Footer />
      </div>
    </AudioProvider>
  );
}