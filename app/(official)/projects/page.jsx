// Path: app/(official)/projects/page.jsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import styles from "./page.module.css";
import OptimizedImage from "@components/OptimizedImage/OptimizedImage";

const projects = [
  {
    id: 1,
    slug: "ophthalmology",
    name: "[2025] Ophthalmology website",
    image: "/images/ofthalmology_featureimage.png",
    url: "https://www.clinicaoftalmologicamendivil.com/",
    external: true,
  },
  {
    id: 2,
    slug: "holiday-booking",
    name: "[2024] Holiday booking platform",
    image: "/images/feature_holiday.png",
    url: "https://tadelfia.carlosmarten.com/",
    external: true, // Mark as external for iframe preview
  }

];

const ProjectCard = ({ project }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();

    // If external project, use preview route
    if (project.external) {
      startTransition(() => {
        router.push(`/preview/${project.slug}`);
      });
    } else {
      // For internal routes, navigate directly
      startTransition(() => {
        router.push(project.url);
      });
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`${styles.projectCard} ${isPending ? styles.loading : ""}`}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick(e);
        }
      }}
    >
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
          that drives my work. Click on any project to view it in a preview or
          visit it directly.
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