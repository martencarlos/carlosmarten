import {auth} from '@actions/../auth.js';
import {redirect} from 'next/navigation';
import styles from './layout.module.css';
import Navigation from '@components/Navigation/Navigation';

export default async function DashboardLayout({children}) {
  const session = await auth ();

  if (!session) {
    redirect ('/login');
  }

  return (
    <div className={styles.layout}>
      <Navigation />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
