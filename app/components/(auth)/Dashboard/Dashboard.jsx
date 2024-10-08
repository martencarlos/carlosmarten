// components/Dashboard.js

'use client';

import ContactsTable from '../ContactsTable/ContactsTable';
import styles from './page.module.css';

const Dashboard = ({ onLogout }) => {
  return (
    <div className={styles.dashboard}>
      <h1>Dashboard</h1>
      <ContactsTable />
      <button className={styles.logout} onClick={onLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
