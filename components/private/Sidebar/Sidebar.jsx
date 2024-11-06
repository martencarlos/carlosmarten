"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiDashboardLine,
  RiContactsLine,
  RiSettings4Line,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
} from "react-icons/ri";
import SignOutButton from "@components/(auth)/signout-button/signout-button";
import styles from "./sidebar.module.css";

const Sidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) setIsOpen(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navItems = [
    { path: "/dashboard", label: "Overview", icon: RiDashboardLine },
    { path: "/dashboard/contacts", label: "Contacts", icon: RiContactsLine },
    { path: "/dashboard/settings", label: "Settings", icon: RiSettings4Line },
  ];

  return (
    <>
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <RiMenuFoldLine /> : <RiMenuUnfoldLine />}
      </button>

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
      >
        <header className={styles.header}>
          <h1 className={styles.logo}>Dashboard</h1>
        </header>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navItems.map(({ path, label, icon: Icon }) => (
              <li
                key={path}
                className={`${styles.navItem} ${
                  pathname === path ? styles.active : ""
                }`}
              >
                <Link href={path} className={styles.navLink}>
                  <Icon className={styles.navIcon} />
                  <span className={styles.navLabel}>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <footer className={styles.footer}>
          <SignOutButton />
        </footer>
      </aside>
    </>
  );
};

export default Sidebar;
