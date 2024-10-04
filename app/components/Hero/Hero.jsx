"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import styles from './hero.module.css';

const Hero = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until the component has mounted
  if (!mounted) {
    return null;
  }

  return (
    <section className={`${styles.heroSection} ${resolvedTheme === 'dark' ? styles.dark : ''}`}>
      {/* Left Image */}
      <motion.div
        className={styles.imageContainer}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Image
          src="/images/me.png"
          alt="Hero Image"
          width={200}
          height={200}
          className={styles.roundedImage}
        />
      </motion.div>

      {/* Right Text */}
      <motion.div
        className={styles.textContainer}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className={styles.title}>Welcome to my Website</h1>
        <p className={styles.subtitle}>
          I am excited to have you here. Explore my services and offerings.
        </p>
      </motion.div>
    </section>
  );
};

export default Hero;