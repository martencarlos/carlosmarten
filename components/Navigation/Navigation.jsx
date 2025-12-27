// components/Navigation/Navigation.jsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiDashboardLine,
  RiContactsLine,
  RiSettings4Line,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiMenuLine,
} from "react-icons/ri";
import SignOutButton from "@components/(auth)/signout-button/signout-button";
import styles from "./navigation.module.css";
import { useTheme } from "next-themes";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Overview", icon: RiDashboardLine },
  { path: "/dashboard/contacts", label: "Contacts", icon: RiContactsLine },
  { path: "/dashboard/settings", label: "Settings", icon: RiSettings4Line },
];

const Navigation = () => {
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  // State for sidebar visibility
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop: minimized vs full
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Mobile: open vs closed
  const [isMobile, setIsMobile] = useState(false);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false); // Reset mobile state when switching to desktop
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile) setIsMobileOpen(false);
  }, [pathname, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <>
      {/* Mobile Header Bar (Visible only on mobile) */}
      <div className={styles.mobileHeader}>
        <button
          className={styles.mobileToggleBtn}
          onClick={toggleSidebar}
          aria-label="Toggle Menu"
        >
          <RiMenuLine />
        </button>
        <span className={styles.mobileTitle}>Dashboard</span>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""
          } ${isMobileOpen ? styles.mobileOpen : ""} ${resolvedTheme === "dark" ? styles.dark : ""
          }`}
      >
        <header className={styles.sidebarHeader}>
          {!isCollapsed && <h1 className={styles.sidebarTitle}>Dashboard</h1>}

          <button
            className={styles.toggleBtn}
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
          </button>
        </header>

        <nav className={styles.sidebarNav}>
          <ul className={styles.sidebarList}>
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <li key={path} className={styles.sidebarItem}>
                <Link
                  href={path}
                  className={`${styles.sidebarLink} ${pathname === path ? styles.active : ""
                    }`}
                  title={isCollapsed ? label : ""}
                >
                  <div className={styles.linkContent}>
                    <Icon className={styles.icon} />
                    <span className={`${styles.label} ${isCollapsed ? styles.hiddenLabel : ""}`}>
                      {label}
                    </span>
                  </div>
                  {pathname === path && !isCollapsed && (
                    <div className={styles.activeIndicator} />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <footer className={styles.sidebarFooter}>
          <SignOutButton className={`${styles.logoutButton} ${isCollapsed ? styles.collapsedLogout : ""}`}>
            {isCollapsed ? "Log out" : "Sign Out"}
          </SignOutButton>
        </footer>
      </aside>
    </>
  );
};

export default Navigation;