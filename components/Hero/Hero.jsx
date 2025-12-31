// components / Hero / Hero.jsx
"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import styles from "./hero.module.css";
import { useState, useEffect } from "react";
import OptimizedImage from "@components/OptimizedImage/OptimizedImage";
import HeroSkeleton from "./HeroSkeleton";

const Hero = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <HeroSkeleton />;
  }

  return (
    <div
      className={`${styles.heroSection} ${theme === "dark" ? styles.dark : ""}`}
    >
      <motion.div
        className={styles.imageContainer}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* The floating animation logic using framer-motion */}
        <motion.div
          animate={{ y: [-15, 5, -15] }} // Subtle vertical float
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut"
          }}
          className={styles.imageWrapper}
        >
          {/* The blurred gradient blob behind */}
          <div className={styles.imageBackdrop} />

          {/* The image itself, styled as a blob via CSS */}
          <OptimizedImage
            src="/images/me.jpeg"
            alt="Carlos Marten"
            priority
            width={340}
            height={340}
            className={styles.heroImage}
          />
        </motion.div>
      </motion.div>

      <motion.div
        className={styles.textContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        <h3 className={styles.title}>
          Interested in Business Technology, Design, Projects and News?
        </h3>
        <br />
        <p className={styles.subtitle}>
          As Head of Digital Transformation, I am passionate about new technologies
          and their impact on businesses. Here, you will find exciting blog
          posts on business and technology topics.
        </p>
        <p className={styles.subtitle}>
          Check out the projects page for the solutions I have developed across
          various industries, demonstrating the synergy between technology and
          business.
        </p>

        <p className={styles.subtitle}>
          Stay updated with the latest insights and trends in business and
          technology. Join me as we explore new ideas and bring innovative
          concepts to life!
        </p>
      </motion.div>
    </div>
  );
};

export default Hero;