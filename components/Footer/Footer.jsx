import Link from "next/link";
import { SiSailsdotjs } from "react-icons/si";

import styles from "./footer.module.css";

const Footer = () => {
  console.log("Footer loaded");
  return (
    <footer className={styles.footer}>
      <div className={styles.content} suppressHydrationWarning>
        <p>&copy; {new Date().getFullYear()} Carlos Marten</p>
        <nav>
          <Link href="/about" className={styles.link}>
            About
          </Link>
          <Link href="/contact" className={styles.link}>
            Contact
          </Link>
          <Link href="/dashboard" className={styles.link}>
            <SiSailsdotjs />
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
