// Path: components/Navbar/Navbar.jsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./navbar.module.css";
import ThemeToggle from "./ThemeToggle/ThemeToggle";
import MobileMenu from "./MobileMenu/MobileMenu";
import { useTheme } from "next-themes";
import { useEffect, useState, useTransition } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [pendingPath, setPendingPath] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prefetch pages on mount for instant navigation
  useEffect(() => {
    if (mounted) {
      router.prefetch('/projects');
      router.prefetch('/blog');
      router.prefetch('/about');
      router.prefetch('/contact');
    }
  }, [mounted, router]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setPendingPath(href);
    startTransition(() => {
      router.push(href);
    });
  };

  const navItems = [
    { href: '/projects', label: 'Projects' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
  ];

  return (
    <div
      className={`${styles.navbar_container} ${
        mounted && resolvedTheme === "dark" ? styles.dark : ""
      } ${scrolled ? styles.scrolled : ""}`}
    >
      <nav className={styles.navbar}>
        <Link 
          href="/" 
          className={styles.logo}
          onClick={(e) => handleNavClick(e, '/')}
        >
          <span className={styles.logoText}>Carlos Marten</span>
        </Link>

        <MobileMenu />

        <ul className={styles.navList}>
          {navItems.map(({ href, label }) => (
            <li key={href} className={styles.navItem}>
              <Link
                href={href}
                className={`${styles.navLink} ${
                  pathname === href ? styles.active : ""
                } ${isPending && pendingPath === href ? styles.loading : ""}`}
                onClick={(e) => handleNavClick(e, href)}
              >
                {label}
              </Link>
            </li>
          ))}
          <li className={styles.navItem}>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </div>
  );
}