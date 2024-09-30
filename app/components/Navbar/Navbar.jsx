"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './navbar.module.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.navbar_container}>
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        Carlos Marten
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
          <Link href="/projects" className={styles.navLink}>Projects</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/blog" className={styles.navLink}>Blog</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/about" className={styles.navLink}>About</Link>
        </li>
      </ul>
    </nav>
    </div>
  );
};

export default Navbar;