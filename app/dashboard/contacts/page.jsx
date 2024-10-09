// components/Dashboard.js

'use client';

import ContactsList from '@components/(auth)/ContactsList/ContactsList';
import styles from './page.module.css';

const Contacts = () => {

  console.log("Dashboard - Contacts loaded");

  return (
    <div className={styles.contactsMain}>
      <h2>List of people who contacted</h2>
      <ContactsList />
    </div>
  );
};

export default Contacts;
