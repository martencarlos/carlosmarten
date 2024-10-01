"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import styles from './navbar.module.css';
import { Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    setMounted(true);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const toggleTheme = () => {
    handleLinkClick();
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) return null;

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.navbar_container}>
      <nav className={styles.navbar}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>Carlos Marten</span>
        </Link>
        {isMobile && (
          <button className={`${styles.hamburger} ${isOpen ? styles.open : ''}`} onClick={toggleNavbar}>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>
        )}
        <ul className={`${styles.navList} ${isOpen ? styles.open : ''}`}>
          <li className={styles.navItem}>
            <Link href="/projects" className={styles.navLink} onClick={handleLinkClick}>Projects</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/blog" className={styles.navLink} onClick={handleLinkClick}>Blog</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/about" className={styles.navLink} onClick={handleLinkClick}>About</Link>
          </li>
          <li className={styles.navItem}>
            <button onClick={toggleTheme} className={styles.themeToggle}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;