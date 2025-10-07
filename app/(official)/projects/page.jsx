// Path: app/(official)/projects/page.jsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import styles from "./page.module.css";
import OptimizedImage from "@components/OptimizedImage/OptimizedImage";

const projects = [
  {
    id: 1,
    name: "Holiday booking platform",
    image: "/images/feature_holiday.png",
    url: "https://tadelfia.carlosmarten.com/",
  },
  {
    id: 2,
    name: "Ophthalmology website",
    image: "/images/ofthalmology_featureimage.png",
    url: "https://bookingengine.carlosmarten.com/",
  },
  {
    id: 3,
    name: "E-commerce site",
    image: "/images/feature_webframe.png",
    url: "https://webframe.carlosmarten.com/",
  },
  {
    id: 4,
    name: "Blog website",
    image: "/images/feature_blog.png",
    url: "https://project-blog.carlosmarten.com/",
  },
  {
    id: 5,
    name: "Wordpress pages",
    image:
      "https://rocketmedia.b-cdn.net/wp-content/uploads/2021/11/wordpress-ventajas-banner.png",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/wordpress/`,
  },
  {
    id: 6,
    name: "Cloud Storage",
    image:
      "https://www.hkcert.org/f/guideline/218189/1200c630/hkcert-Cloud%20Storage%20Security%20banner-1860x1046.jpg",
    url: `https://storage.carlosmarten.com/`,
  },
  {
    id: 7,
    name: "Tetris",
    image:
      "https://www.jotdown.es/wp-content/uploads/2018/05/oie_16163755ZTTU8YqCPO.jpg",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/games/tetris/`,
  },
  {
    id: 8,
    name: "Project Management",
    image:
      "https://wdp.carlosmarten.com/wp-content/uploads/2025/04/project-management.jpeg",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/business/project-timeline/`,
  },
];

const ProjectCard = ({ project, onNavigate }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = (e) => {
    // If it's an external URL, let it navigate normally
    if (project.url.startsWith('http') && !project.url.includes(process.env.NEXT_PUBLIC_SITE_URL)) {
      return;
    }

    // For internal links, use transition
    e.preventDefault();
    startTransition(() => {
      router.push(project.url);
    });
  };

  return (
    <Link href={project.url} passHref onClick={handleClick}>
      <div className={`${styles.projectCard} ${isPending ? styles.loading : ""}`}>
        <OptimizedImage
          priority={project.id <= 4}
          src={project.image}
          width={200}
          height={200}
          alt={project.name}
          className={styles.projectImage}
        />
        <h2 className={styles.projectName}>{project.name}</h2>
        {isPending && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default function ProjectsPage() {
  console.log("Projects page loaded");
  
  return (
    <div className={styles.projectsContainer}>
      <h1 className={styles.pageTitle}>Web Projects</h1>
      <br />
      <h2 className={styles.pageSubTitle}>
        Explore the latest web implementations
      </h2>

      <div className={styles.pageDescription}>
        <p>
          Here, I showcase some of the key projects I have worked on,
          highlighting my experience and skills in web development.
        </p>

        <p>
          From a dynamic holiday booking platform to an intuitive e-commerce
          site, and a versatile blog, each project reflects my focus on creating
          functional, user-friendly solutions.
        </p>

        <p>
          Explore these projects to see the blend of creativity and technology
          that drives my work.
        </p>
      </div>

      <div className={styles.projectGrid}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      <br />
      <br />
    </div>
  );
}