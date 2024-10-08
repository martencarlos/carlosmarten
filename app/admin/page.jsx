'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@components/(auth)/LoginForm/LoginForm';
import Dashboard from '@components/(auth)/Dashboard/Dashboard';
import LoadingComponent from '@components/LoadingComponent/LoadingComponent';
import styles from './page.module.css';

const Admin = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

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

    useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
    }, []);

  const handleLogout = async () => {
    const response = await fetch('/api/session', {
      method: 'DELETE',
    });
    if (response.ok) {
      setSession(null); // Update session state
      router.push('/'); // Redirect to login page after logout
    } else {
      const { error } = await response.json();
      alert('Logout failed: ' + error);
    }
  };

  if (loading) return (
    <div className={styles.adminPage}>
      <LoadingComponent />
    </div>
  );

  if (!mounted) return null;

  return session ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <LoginForm />
  );
};

export default Admin;
