// Path: components/Navbar/MobileMenu/MobileMenu.jsx
"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import styles from "./mobilemenu.module.css";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pendingPath, setPendingPath] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  const { setTheme, resolvedTheme } = useTheme();

  // Prefetch pages on mount
  useEffect(() => {
    router.prefetch('/projects');
    router.prefetch('/blog');
    router.prefetch('/about');
  }, [router]);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isMobile]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleLinkClick = (e, href) => {
    e.preventDefault();
    if (isMobile) {
      setIsOpen(false);
    }
    setPendingPath(href);
    startTransition(() => {
      router.push(href);
    });
  };

  const toggleTheme = () => {
    if (isMobile) {
      setIsOpen(false);
    }
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { href: "/projects", label: "Projects" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
  ];

  return (
    <div
      className={`${styles.mobileMenu} ${
        resolvedTheme === "dark" ? styles.dark : ""
      }`}
    >
      <button
        ref={buttonRef}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-menu"
        className={`${styles.hamburger} ${isOpen ? styles.open : ""}`}
        onClick={toggleMenu}
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          className={styles.backdrop}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Navigation menu */}
      <nav
        ref={menuRef}
        id="mobile-nav-menu"
        className={`${styles.navList} ${isOpen ? styles.open : ""}`}
        aria-label="Mobile navigation"
      >
        <ul role="list">
          {navItems.map((item) => (
            <li key={item.href} className={styles.navItem}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${
                  pathname === item.href ? styles.active : ""
                } ${isPending && pendingPath === item.href ? styles.loading : ""}`}
                onClick={(e) => handleLinkClick(e, item.href)}
                tabIndex={isOpen ? 0 : -1}
              >
                {item.label}
                {isPending && pendingPath === item.href && (
                  <span className={styles.loadingDot}></span>
                )}
              </Link>
            </li>
          ))}
          <li className={styles.navItem}>
            <button
              onClick={toggleTheme}
              className={styles.themeToggle}
              aria-label={`Switch to ${
                resolvedTheme === "dark" ? "light" : "dark"
              } mode`}
              tabIndex={isOpen ? 0 : -1}
            >
              {resolvedTheme === "dark" ? (
                <FaSun size={20} aria-hidden="true" />
              ) : (
                <FaMoon size={20} aria-hidden="true" />
              )}
              <span className={styles.themeToggleText}>
                {resolvedTheme === "dark" ? "Light" : "Dark"} Mode
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default MobileMenu;