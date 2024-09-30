// components/Navbar.jsx
import Link from 'next/link';
import styles from './navbar.module.css';  // Import CSS module

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link href="/" className={styles.navLink}>Carlos Marten</Link>
        </li>
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
  );
};

export default Navbar;

