import Link from "next/link";

import styles from "./footer.module.css";

const Footer = () => {
  console.log("Footer loaded");
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p>&copy; {new Date().getFullYear()} Carlos Marten</p>
        <nav>
          <Link href="/about" className={styles.link}>
            About
          </Link>
          <Link href="/contact" className={styles.link}>
            Contact
          </Link>
          <Link href="/privacy" className={styles.link}>
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
