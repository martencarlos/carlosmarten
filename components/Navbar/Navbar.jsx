"use client";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Import usePathname
import styles from "./navbar.module.css";
import ThemeToggle from "./ThemeToggle/ThemeToggle";
import MobileMenu from "./MobileMenu/MobileMenu";
import { useTheme } from "next-themes";

export default function Navbar() {
  const pathname = usePathname(); // Get the current pathname
  const { theme } = useTheme();
  console.log("Navbar loaded - pathname:", pathname);

  return (
    <div
      className={`${styles.navbar_container} ${
        theme === "dark" ? styles.dark : ""
      }`}
    >
      <nav className={`${styles.navbar} `}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Carlos Marten</span>
        </Link>
        <MobileMenu />
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link
              href="/projects"
              className={`${styles.navLink} ${
                pathname === "/projects" ? styles.active : ""
              }`} // Conditional class
            >
              Projects
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link
              href="/blog"
              className={`${styles.navLink} ${
                pathname === "/blog" ? styles.active : ""
              }`} // Conditional class
            >
              Blog
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link
              href="/about"
              className={`${styles.navLink} ${
                pathname === "/about" ? styles.active : ""
              }`} // Conditional class
            >
              About
            </Link>
          </li>
          <li className={styles.navItem}>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </div>
  );
}
