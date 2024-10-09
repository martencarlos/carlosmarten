// components/Dashboard.js

'use client';

import ContactsList from '../ContactsList/ContactsList';

import styles from './page.module.css';

const Dashboard = ({setSession}) => {

  //  Handle logout request by sending a DELETE request to the /api/session route
  const handleLogout = async () => {
    const response = await fetch('/api/session', {
      method: 'DELETE',
    });
    if (response.ok) {
      setSession(null); // Update session state
    } else {
      const { error } = await response.json();
      alert('Logout failed: ' + error);
    }
  };

  return (
    <div className={styles.dashboard}>
      <h1>Dashboard</h1>
      <ContactsList />
      <button className={styles.logout} onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
