import Navbar from '@components/Navbar/Navbar';
import Footer from '@components/Footer/Footer';

export default function OfficialLayout({children}) {
  console.log ('official layout loaded');
  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <Navbar />
      <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
        {children}
      </div>
      <Footer />
    </div>
  );
}
