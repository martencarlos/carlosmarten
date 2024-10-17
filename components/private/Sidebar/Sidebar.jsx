// app/dashboard/Sidebar.js
"use client";
import { useState } from "react";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";
import styles from "./sidebar.module.css";
import { usePathname } from "next/navigation";
import { SignOut } from "@components/(auth)/signout-button/signout-button";

const Sidebar = () => {
  const isOpen = true;

  const pathname = usePathname(); // To highlight active link

  const toggleSidebar = () => {
    is(!isOpen);
  };

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.active : ""}`}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Dashboard</h1>
        <button className={styles.toggleButton} onClick={toggleSidebar}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </header>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li className={pathname === "/dashboard" ? styles.activeLink : ""}>
            <Link href="/dashboard">Overview</Link>
          </li>
          <li
            className={
              pathname === "/dashboard/contacts" ? styles.activeLink : ""
            }
          >
            <Link href="/dashboard/contacts">Contacts</Link>
          </li>
          <li
            className={
              pathname === "/dashboard/settings" ? styles.activeLink : ""
            }
          >
            <Link href="/dashboard/settings">Settings</Link>
          </li>
        </ul>
      </nav>

      <footer className={styles.sidebarFooter}>
        <SignOut className={styles.logout} />
      </footer>
    </div>
  );
};

export default Sidebar;
