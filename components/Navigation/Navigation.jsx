// components/Navigation/Navigation.jsx
"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiDashboardLine,
  RiContactsLine,
  RiSettings4Line,
} from "react-icons/ri";
import SignOutButton from "@components/(auth)/signout-button/signout-button";
import styles from "./navigation.module.css";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Overview", icon: RiDashboardLine },
  { path: "/dashboard/contacts", label: "Contacts", icon: RiContactsLine },
  { path: "/dashboard/settings", label: "Settings", icon: RiSettings4Line },
];

const DesktopSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className={styles.desktopSidebar}>
      <header className={styles.sidebarHeader}>
        <h1 className={styles.sidebarTitle}>Dashboard</h1>
      </header>

      <nav className={styles.sidebarNav}>
        <ul className={styles.sidebarList}>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <li key={path} className={styles.sidebarItem}>
              <Link
                href={path}
                className={`${styles.sidebarLink} ${
                  pathname === path ? styles.active : ""
                }`}
              >
                <div className={styles.linkContent}>
                  <Icon className={styles.icon} />
                  <span className={styles.label}>{label}</span>
                </div>
                {pathname === path && (
                  <div className={styles.activeIndicator} />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <footer className={styles.sidebarFooter}>
        <SignOutButton className={styles.logoutButton} />
      </footer>
    </aside>
  );
};

const MobileNavigation = () => {
  const pathname = usePathname();

  return (
    <nav className={styles.mobileNav}>
      <ul className={styles.mobileList}>
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <li key={path} className={styles.mobileItem}>
            <Link
              href={path}
              className={`${styles.mobileLink} ${
                pathname === path ? styles.active : ""
              }`}
            >
              <Icon className={styles.mobileIcon} />
              <span className={styles.mobileLabel}>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const Navigation = () => {
  return (
    <>
      <DesktopSidebar />
      <MobileNavigation />
    </>
  );
};

export default Navigation;