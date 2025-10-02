// pages/about.js

'use client';
import {useEffect, useState} from 'react';
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function About () {
  console.log ('About page loaded');
  const [isVisible, setIsVisible] = useState (false);

  useEffect (() => {
    setIsVisible (true);
  }, []);

  return (
    <div className={styles.container}>

      <div className={`${styles.content} ${isVisible ? styles.visible : ''}`}>
        <Image
          src="/images/me.jpeg"
          width={800}
          priority
          height={800}
          alt="Carlos Marten"
          className={styles.profilePic}
        />
        <br />

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
          I am a digital transformation leader with over 10 years of experience delivering large-scale IT and business change across financial services, healthcare, automotive, and the public sector. Since 2023, I have headed the Digital Transformation unit at Seidor S.A., driving end-to-end consulting and architecture-led delivery with Salesforce, MuleSoft, Azure, AWS, and AI/LLM solutions.
        </p>

        <p>
          Previously, I was Team Lead at GetNet/PagoNxt (Santander Group) in Munich, where I led international digitalization projects, rolled out CRM platforms, and acted as Product Owner for digital onboarding. I worked closely with senior management to improve customer experience and drive adoption of new technologies.
        </p>

        <p>
          Earlier in my career, I was a Senior Consultant at Deloitte Luxembourg, focusing on IT strategy, core system transformations, and financial product design. I also contributed to Deloitte publications on open banking and PSD2, and supported major European banks with operating model and risk projects.
        </p>

        <p>
          I hold an Executive MBA from TUM, a business degree from Harvard, and a Master’s in Computer Engineering from CEU. Certified in Salesforce, Blockchain, PRINCE2, and Agile, I speak six languages and thrive in leading cross-cultural teams to deliver impactful digital transformation.
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
