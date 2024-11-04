// app/dashboard/Sidebar.js
"use client";
import Link from "next/link";
import styles from "./sidebar.module.css";
import { usePathname } from "next/navigation";
import SignOutButton from "@components/(auth)/signout-button/signout-button";

const Sidebar = () => {
  const pathname = usePathname(); // To highlight active link

  return (
    <div className={`${styles.sidebar}`}>
      <header className={styles.header}>
        <h1 className={styles.logo}> </h1>
      </header>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li
            className={`${pathname === "/dashboard" ? styles.activeLink : ""} ${
              styles.link
            }`}
          >
            <Link className={styles.linka} href="/dashboard">
              Overview
            </Link>
          </li>
          <li
            className={`${
              pathname === "/dashboard/contacts" ? styles.activeLink : ""
            } ${styles.link}`}
          >
            <Link className={styles.linka} href="/dashboard/contacts">
              Contacts
            </Link>
          </li>
          <li
            className={`${
              pathname === "/dashboard/settings" ? styles.activeLink : ""
            } ${styles.link}`}
          >
            <Link className={styles.linka} href="/dashboard/settings">
              Settings
            </Link>
          </li>
        </ul>
      </nav>

      <footer className={styles.sidebarFooter}>
        <SignOutButton />
      </footer>
    </div>
  );
};

export default Sidebar;
