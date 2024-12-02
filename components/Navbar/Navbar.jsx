"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";
import ThemeToggle from "./ThemeToggle/ThemeToggle";
import MobileMenu from "./MobileMenu/MobileMenu";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`${styles.navbar_container} ${
        mounted && resolvedTheme === "dark" ? styles.dark : ""
      }`}
    >
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Carlos Marten</span>
        </Link>

        {/* Mobile menu is always rendered but might be hidden via CSS */}
        <MobileMenu />

        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <Link
              href="/projects"
              className={`${styles.navLink} ${
                pathname === "/projects" ? styles.active : ""
              }`}
            >
              Projects
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link
              href="/blog"
              className={`${styles.navLink} ${
                pathname === "/blog" ? styles.active : ""
              }`}
            >
              Blog
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link
              href="/about"
              className={`${styles.navLink} ${
                pathname === "/about" ? styles.active : ""
              }`}
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
