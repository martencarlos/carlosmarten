"use client"

import { useState, useEffect } from 'react';
import styles from '../navbar.module.css';

const MobileMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <>
      <button 
        className={`${styles.hamburger} ${isOpen ? styles.open : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>
      {isOpen && (
        <ul className={`${styles.navList} ${styles.open}`}>
          {children}
        </ul>
      )}
    </>
  );
};

export default MobileMenu;