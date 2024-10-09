"use client";

import React, { useEffect, useState } from 'react';
import { FaUser, FaEnvelope, FaComment } from 'react-icons/fa';
import styles from './contactslist.module.css';

const ContactsList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contact');
        if (!response.ok) {
          throw new Error('Failed to fetch contacts');
        }
        const data = await response.json();
        setContacts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) return <p className={styles.message}>Loading...</p>;
  if (error) return <p className={styles.message}>Error: {error}</p>;

  return (
    <div className={styles.container}>
      {contacts.map((contact) => (
        <div key={contact.id} className={styles.contactCard}>
          <div className={styles.contactInfo}>
            <div className={styles.contactDetail}>
              <FaUser className={styles.icon} />
              <span className={styles.value}>{contact.name}</span>
            </div>
            <div className={styles.contactDetail}>
              <FaEnvelope className={styles.icon} />
              <span className={styles.value}>{contact.email}</span>
            </div>
          </div>
          <div className={styles.messageSection}>
            <FaComment className={styles.icon} />
            <span className={styles.messageValue}>{contact.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactsList;
