// app/dashboard/Sidebar.js
"use client";
import { useState } from "react";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";
import styles from "./sidebar.module.css";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // To highlight active link

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  function handleLogout() {
    router.push("/logout");
  }

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
        <button className={styles.logout} onClick={handleLogout}>
          Logout
        </button>
      </footer>
    </div>
  );
};

export default Sidebar;
