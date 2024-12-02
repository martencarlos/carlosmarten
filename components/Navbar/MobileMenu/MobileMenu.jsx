"use client";

import React, { useState, useEffect } from "react";
import styles from "./mobilemenu.module.css";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "next-themes";
import Link from "next/link";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    <div
      className={`${styles.mobileMenu} ${
        resolvedTheme === "dark" ? styles.dark : ""
      }`}
    >
      <button
        aria-label="Toggle menu"
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
              {theme === "dark" ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default MobileMenu;
