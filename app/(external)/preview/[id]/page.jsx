// Path: app/(external)/preview/[id]/page.jsx

import ProjectPreview from "@components/Project/ProjectPreview/ProjectPreview";
import { notFound } from "next/navigation";

// Define your projects with their metadata
const projects = {
  "holiday-booking": {
    name: "Holiday Booking Platform",
    url: "https://tadelfia.carlosmarten.com/",
  },
  "ophthalmology": {
    name: "Ophthalmology Website",
    url: "https://bookingengine.carlosmarten.com/",
  },
  "ecommerce": {
    name: "E-commerce Site",
    url: "https://webframe.carlosmarten.com/",
  },
  "blog": {
    name: "Blog Website",
    url: "https://project-blog.carlosmarten.com/",
  },
  "cloud-storage": {
    name: "Cloud Storage",
    url: "https://storage.carlosmarten.com/",
  },
};

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = projects[id];

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.name} Preview - Carlos Marten`,
    description: `Preview of ${project.name}`,
  };
}

// Generate static params for all projects
export function generateStaticParams() {
  return Object.keys(projects).map((id) => ({
    id,
  }));
}

export default async function ProjectPreviewPage({ params }) {
  const { id } = await params;
  const project = projects[id];

  if (!project) {
    notFound();
  }

  return <ProjectPreview projectUrl={project.url} projectName={project.name} />;
}