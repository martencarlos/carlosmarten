import Navbar from "@components/Navbar/Navbar";
import Footer from "@components/Footer/Footer";

export default function OfficialLayout({ children }) {
  console.log("official layout loaded");
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
