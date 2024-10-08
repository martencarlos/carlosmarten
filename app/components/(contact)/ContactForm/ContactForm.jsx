'use client';

import { useState } from 'react';
import styles from './contact.module.css';
import { FaUser, FaEnvelope, FaCommentDots } from 'react-icons/fa'; // Importing icons

export default function ContactForm() {
  console.log('Contact form loaded');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }

    setIsSubmitting(false);
  };

  if (status === 'success') {
    return (
      <div className={`${styles.status} ${styles.statusSuccess}`}>
        Message sent successfully! We&apos;ll get back to you soon.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <FaUser className={styles.icon} />
        <input
          type="text"
          id="name"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <FaEnvelope className={styles.icon} />
        <input
          type="email"
          id="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <FaCommentDots className={styles.icon} />
        <textarea
          id="message"
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className={styles.textarea}
        />
      </div>
      <button type="submit" className={styles.button} disabled={isSubmitting}>
        {isSubmitting ? <span className={styles.spinner}></span> : 'Send'}
      </button>
      {status === 'error' && (
        <div className={`${styles.status} ${styles.statusError}`}>
          Failed to send message. Please try again.
        </div>
      )}
    </form>
  );
}
