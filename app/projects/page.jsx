import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import Image from 'next/image';

const projects = [
  {
    id: 1,
    name: 'Holiday booking project',
    image: '/images/feature_holiday.png',
    url: 'https://tadelfia.carlosmarten.com/',
  },
  {
    id: 2,
    name: 'E-commerce project',
    image: '/images/feature_webframe.png',
    url: 'https://webframe.carlosmarten.com/',
  },
  {
    id: 3,
    name: 'Blog project',
    image: '/images/feature_blog.png',
    url: 'https://project-blog.carlosmarten.com/',
  },
];

const ProjectsPage = () => {
  return (
    <div className={styles.projectsContainer}>
      <h1 className={styles.pageTitle}>Web Projects</h1>
      <div className={styles.projectGrid}>
        {projects.map((project) => (
          <Link href={project.url} key={project.id} passHref>
            <div className={styles.projectCard}>
              <Image
                src={project.image}
                width={200}
                height={200}
                alt={project.name}
                className={styles.projectImage}
              />
              <h2 className={styles.projectName}>{project.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;