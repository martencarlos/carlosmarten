import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

const projects = [
  {
    id: 1,
    name: "Holiday booking project",
    image: "/images/feature_holiday.png",
    url: "https://tadelfia.carlosmarten.com/",
  },
  {
    id: 2,
    name: "E-commerce project",
    image: "/images/feature_webframe.png",
    url: "https://webframe.carlosmarten.com/",
  },
  {
    id: 3,
    name: "Blog project",
    image: "/images/feature_blog.png",
    url: "https://project-blog.carlosmarten.com/",
  },
  {
    id: 4,
    name: "Wordpress pages",
    image:
      "https://rocketmedia.b-cdn.net/wp-content/uploads/2021/11/wordpress-ventajas-banner.png",
    url: `${process.env.HOST}/wordpress/`,
  },
];

const ProjectCard = ({ project }) => (
  <Link href={project.url} passHref>
    <div className={styles.projectCard}>
      <Image
        priority
        src={project.image}
        width={200}
        height={200}
        alt={project.name}
        className={styles.projectImage}
      />
      <h2 className={styles.projectName}>{project.name}</h2>
    </div>
  </Link>
);

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
        <br />
        <p>
          From a dynamic holiday booking platform to an intuitive e-commerce
          site, and a versatile blog, each project reflects my focus on creating
          functional, user-friendly solutions.
        </p>
        <br />
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
