'use client';

import { useState, useEffect } from 'react';

import LoginForm from '@components/(auth)/LoginForm/LoginForm';
import Dashboard from '@components/(auth)/Dashboard/Dashboard';
import LoadingComponent from '@components/LoadingComponent/LoadingComponent';
import styles from './page.module.css';

const Admin = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
 

  // Fetch the session data when the component mounts
  useEffect(() => {
    const getSession = async () => {
      const response = await fetch('/api/session');
      if (response.ok) {
        const { session } = await response.json();
        setSession(session);
      } else {
        setSession(null); // Handle session retrieval failure
      }
      setLoading(false);
    };
    getSession();
  }, []);


  // Check if the component is mounted before rendering
  if (loading) return (
    <div className={styles.adminPage}>
      <LoadingComponent />
    </div>
  );


  return session ? (
    <Dashboard setSession = {setSession} />
  ) : (
    <LoginForm setSession = {setSession} />
  );
};

export default Admin;
