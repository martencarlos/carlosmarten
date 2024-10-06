"use client";

import { useState, useEffect } from "react";
import styles from "./mobilemenu.module.css";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile) return null;
  if (!mounted) return null;

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const toggleTheme = () => {
    handleLinkClick();
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <button
        className={`${styles.hamburger} ${isOpen ? styles.open : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>
      {isOpen && (
        <ul className={`${styles.navList} ${styles.open}`}>
          <li className={styles.navItem}>
            <Link
              href="/projects"
              className={styles.navLink}
              onClick={handleLinkClick}
            >
              Projects
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link
              href="/blog"
              className={styles.navLink}
              onClick={handleLinkClick}
            >
              Blog
            </Link>
          </li>
          <li className={styles.navItem}>
            <Link
              href="/about"
              className={styles.navLink}
              onClick={handleLinkClick}
            >
              About
            </Link>
          </li>
          <li className={styles.navItem}>
            <button onClick={toggleTheme} className={styles.themeToggle}>
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </li>
        </ul>
      )}
    </>
  );
};

export default MobileMenu;
