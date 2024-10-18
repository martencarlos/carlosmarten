"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import styles from "./hero.module.css";

const Hero = () => {
  const { theme } = useTheme();
  console.log("Hero component loaded");
  // Don't render anything until the component has mounted
  // if (!mounted) {
  //   return null;
  // }

  return (
    <div
      className={`${styles.heroSection} ${theme === "dark" ? styles.dark : ""}`}
    >
      {/* Left Image 
      <motion.div
        className={styles.imageContainer}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >*/}
      <div className={styles.imageContainer}>
        <Image
          src="/images/me.png"
          alt="Hero Image"
          priority
          width={200}
          height={200}
          className={styles.roundedImage}
        />
      </div>
      {/*</motion.div>*/}

      {/* Right Text 
      <motion.div
        className={styles.textContainer}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >*/}
      <div className={styles.textContainer}>
        <h3 className={styles.title}>
          Interested in Business Technology, Design, Projects and News?
        </h3>
        <br />
        <p className={styles.subtitle}>
          As an IT Business Consultant, I am passionate about new technologies
          and their impact on businesses. Here, you will find exciting blog
          posts on business and technology topics.
        </p>
        <p className={styles.subtitle}>
          <br />
          Check out the projects page for the solutions I have developed across
          various industries, demonstrating the synergy between technology and
          business.
        </p>
        <br />
        <p className={styles.subtitle}>
          Stay updated with the latest insights and trends in business and
          technology. Join me as we explore new ideas and bring innovative
          concepts to life!
        </p>
      </div>
      {/*  </motion.div>*/}
    </div>
  );
};

export default Hero;
