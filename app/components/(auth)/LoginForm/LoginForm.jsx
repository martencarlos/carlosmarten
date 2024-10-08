'use client';

import { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import styles from './page.module.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
const [mounted, setMounted] = useState(false); // Add a mounted state

    useEffect(() => {
    setMounted(true); // Set mounted to true
    return () => setMounted(false); // Set mounted to false on unmount
    }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      // Handle successful login
      console.log('Login successful');
      window.location.reload();
    } else {
      const { error } = await response.json();
      setErrorMessage(error); // Set the error message to display
    }
  };

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleLogin}>
        <div>
          <label className={styles.label}>Email:</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={styles.label}>Password:</label>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className={styles.button} type="submit">Login</button>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>} {/* Display error message if any */}
      </form>
    </div>
  );
};

export default LoginForm;
