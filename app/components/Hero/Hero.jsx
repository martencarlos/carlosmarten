"use client"; // Ensure it's a client component

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTheme } from 'next-themes'; // Import useTheme
import styles from './hero.module.css';

const Hero = () => {
  const { theme } = useTheme(); // Access theme

  return (
    <section className={`${styles.heroSection} ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Left Image */}
      <motion.div
        className={styles.imageContainer}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Image
          src="/images/me.png" // Update with your image path
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
        <h1 className={`${styles.title} ${theme === 'dark' ? 'dark' : ''}`}>Welcome to my Website</h1>
        <p className={`${styles.subtitle} ${theme === 'dark' ? 'dark' : ''}`}>
          I am excited to have you here. Explore my services and offerings.
        </p>
      </motion.div>
    </section>
  );
};

export default Hero;
