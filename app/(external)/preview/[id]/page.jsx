// Path: app/(external)/preview/[id]/page.jsx

import ProjectPreview from "@components/Project/ProjectPreview/ProjectPreview";
import { notFound } from "next/navigation";

// Force dynamic rendering so updates to the projects object are reflected immediately
// export const dynamic = 'force-dynamic';

// Define your projects with their metadata
const projects = {
  "ophthalmology": {
    name: "Ophthalmology Website",
    url: "https://www.clinicaoftalmologicamendivil.com/",
  },

  "holiday-booking": {
    name: "Holiday Booking Platform",
    url: "https://tadelfia.carlosmarten.com/",
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

export default async function ProjectPreviewPage({ params }) {
  const { id } = await params;
  const project = projects[id];

  if (!project) {
    notFound();
  }

  return <ProjectPreview projectUrl={project.url} projectName={project.name} />;
}