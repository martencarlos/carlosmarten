"use client";

// import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import styles from "./hero.module.css";
import { useState, useEffect } from "react";
import OptimizedImage from "@components/OptimizedImage/OptimizedImage";

const Hero = () => {
  const { theme } = useTheme();
  console.log("Hero component loaded");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`${styles.heroSection} ${theme === "dark" ? styles.dark : ""}`}
    >

      <div className={styles.imageContainer}>
   
        <OptimizedImage
          src="/images/me.jpeg"
          alt="Hero Image"
          priority
          width={400}
          height={400}
          className={styles.roundedImage}
        />
      </div>
      <br />

      <div className={styles.textContainer}>
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
      </div>
      {/*  </motion.div>*/}
    </div>
  );
};

export default Hero;
