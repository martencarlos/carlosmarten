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
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
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
    <>
      <div
        className={`${styles.mobileMenu} ${resolvedTheme === "dark" ? styles.dark : ""
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
      </div>

      {/* Portal for backdrop - render at root level */}
      {isMobile && (
        <div
          className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ""} ${resolvedTheme === "dark" ? styles.dark : ""
            }`}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
          style={isOpen ? {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            zIndex: 998
          } : {}}
        />
      )}

      {/* Navigation menu - rendered outside to prevent layout shift */}
      <nav
        ref={menuRef}
        id="mobile-nav-menu"
        className={`${styles.navList} ${isOpen ? styles.navListOpen : ""} ${resolvedTheme === "dark" ? styles.dark : ""}`}
        aria-label="Mobile navigation"
      >
        <ul role="list">
          {navItems.map((item, index) => (
            <li
              key={item.href}
              className={styles.navItem}
              style={{ "--item-index": index }}
            >
              <Link
                href={item.href}
                className={`${styles.navLink} ${pathname === item.href ? styles.active : ""
                  } ${isPending && pendingPath === item.href ? styles.loading : ""
                  }`}
                onClick={(e) => handleLinkClick(e, item.href)}
                tabIndex={isOpen ? 0 : -1}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className={styles.navItem} style={{ "--item-index": navItems.length }}>
            <button
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              tabIndex={isOpen ? 0 : -1}
            >
              {resolvedTheme === "dark" ? (
                <>
                  <FaSun size={18} />
                  <span className={styles.themeToggleText}>Light Mode</span>
                </>
              ) : (
                <>
                  <FaMoon size={18} />
                  <span className={styles.themeToggleText}>Dark Mode</span>
                </>
              )}
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default MobileMenu;