// pages/about.js

"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";

export default function About() {
  console.log("About page loaded");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={`${styles.title} ${isVisible ? styles.visible : ""}`}>
        About Me
      </h1>

      <div className={`${styles.content} ${isVisible ? styles.visible : ""}`}>
        <Image
          src="/images/me.jpeg"
          width={400}
          priority
          height={400}
          alt="Carlos Marten"
          className={styles.profilePic}
        />

        <p>
          Hi, I am Carlos Marten. Welcome to my personal blog! I am a technology
          & business consultant based in Bilbao, Spain. This site is where I
          share my thoughts, projects, and experiences.
        </p>

        <h2>What I Do</h2>

        <ul className={styles.list}>
          <li>Write blog posts about new technologies</li>
          <li>Work on projects related to web/app development</li>
          <li>Share my journey in buisness consulting services</li>
        </ul>
        <br />
        <h2>My Background</h2>
        <p>
          I have 10+ of experience in technolgy & business consulting services.
          My passion for new technologies has led me to start this blog in 2024.
          When I am not writing or providing consulting services, you can find
          me playing tennis or golf.
        </p>

        <p>
          I am an experienced business consultant and project manager with a
          strong background in financial services and digital transformation.
          Currently, I lead the Business Consulting and Functional Processes
          unit at a big and reputed consulting firm, specializing in financial
          services.
        </p>

        <p>
          I hold an Executive MBA from TUM School of Management, and prior to my
          current position, I gained extensive experience at Banco Santander
          group company: PagoNxt, where I managed digitalization projects and
          customer onboarding processes using Salesforce and other technologies.
        </p>

        <p>
          My experience also includes working as a Senior Consultant at
          Deloitte, where I focused on IT transformation and financial product
          implementation. I am fluent in four languages and hold certifications
          in agile methodologies and blockchain technologies.
        </p>

        <div className={styles.cta}>
          <Link href="/blog" className={styles.button}>
            Read My Blog
          </Link>
          <Link href="/projects" className={styles.button}>
            View My Projects
          </Link>
        </div>
      </div>

      <br />
    </div>
  );
}
