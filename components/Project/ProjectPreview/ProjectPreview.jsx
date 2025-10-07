// Path: components/Project/ProjectPreview/ProjectPreview.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./ProjectPreview.module.css";
import { FaArrowLeft, FaExternalLinkAlt } from "react-icons/fa";

export default function ProjectPreview({ projectUrl, projectName }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const iframeRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Reset states when project changes
    setIsLoading(true);
    setError(false);

    // Set a timeout to detect if iframe fails to load
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.log("Iframe loading timeout - likely blocked by X-Frame-Options");
        setIsLoading(false);
        setError(true);
      }
    }, 5000); // 5 second timeout

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [projectUrl, isLoading]);

  const handleBack = () => {
    router.push("/projects");
  };

  const handleOpenExternal = () => {
    window.open(projectUrl, "_blank", "noopener,noreferrer");
  };

  const handleIframeLoad = () => {
    console.log("Iframe loaded successfully");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setError(false);
  };

  const handleIframeError = () => {
    console.log("Iframe error event triggered");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setError(true);
  };

  return (
    <div className={styles.container}>
      {/* Top Banner */}
      <div className={styles.banner}>
        <button
          onClick={handleBack}
          className={styles.backButton}
          aria-label="Back to projects"
        >
          <FaArrowLeft className={styles.icon} />
          <span>Back to Projects</span>
        </button>

        <h1 className={styles.projectTitle}>{projectName}</h1>

        <button
          onClick={handleOpenExternal}
          className={styles.externalButton}
          aria-label="Open in new tab"
        >
          <span>Open in New Tab</span>
          <FaExternalLinkAlt className={styles.icon} />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && !error && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading {projectName}...</p>
          <p className={styles.loadingHint}>
            This may take a few seconds. If it doesn't load, the site may not allow embedding.
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.errorContainer}>
          <h2>Unable to Load Preview</h2>
          <p>
            This project cannot be displayed in an embedded preview due to security
            restrictions set by the external site (X-Frame-Options or CSP headers).
          </p>
          <p className={styles.errorSubtext}>
            Don't worry! You can still view the full project by opening it directly.
          </p>
          <button onClick={handleOpenExternal} className={styles.errorButton}>
            <FaExternalLinkAlt className={styles.icon} />
            Open Project Directly
          </button>
          <button onClick={handleBack} className={styles.backButtonAlt}>
            <FaArrowLeft className={styles.icon} />
            Back to Projects
          </button>
        </div>
      )}

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={projectUrl}
        className={styles.iframe}
        title={projectName}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
        loading="eager"
        style={{ display: isLoading || error ? "none" : "block" }}
      />
    </div>
  );
}