// Path: components/Footer/Footer.jsx
import Link from "next/link";
import { SiSailsdotjs } from "react-icons/si";
import { FaInfoCircle, FaEnvelope } from "react-icons/fa";
import styles from "./footer.module.css";

const Footer = () => {
  console.log("Footer loaded");
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.leftSection}>
            <p className={styles.copyright} suppressHydrationWarning>
              © {currentYear} Carlos Marten
            </p>
          </div>

          <nav className={styles.navigation}>
            <div className={styles.navColumn}>
              <ul className={styles.navList}>
                <li>
                  <Link href="/about" className={styles.navLink}>
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className={styles.navLink}>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className={styles.navColumn}>
              <div className={styles.socialLinks}>
                <Link 
                  href="/about" 
                  className={styles.socialLink}
                  aria-label="About"
                >
                  <FaInfoCircle className={styles.iconOnly} />
                  <span className={styles.textOnly}>About</span>
                </Link>
                <Link 
                  href="/contact"
                  className={styles.socialLink}
                  aria-label="Contact"
                >
                  <FaEnvelope className={styles.iconOnly} />
                  <span className={styles.textOnly}>Contact</span>
                </Link>
                <Link 
                  href="/dashboard" 
                  className={styles.socialLink}
                  aria-label="Dashboard"
                >
                  <SiSailsdotjs />
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;