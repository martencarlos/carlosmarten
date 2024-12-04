"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./optimized-image.module.css";

const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="20%" />
      <stop stop-color="#edeef1" offset="50%" />
      <stop stop-color="#f6f7f8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  className,
  quality = 75,
  onLoad,
  style,
  fill = false,
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      className={`${styles.imageWrapper} ${isLoading ? styles.loading : ""} ${
        className ? className : ""
      }`}
      style={
        fill
          ? { position: "relative", width: "100%", height: "100%" }
          : undefined
      }
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        quality={quality}
        fill={fill}
        style={style}
        className={`${styles.Image} ${className ? className : ""} `}
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${toBase64(
          shimmer(width || 700, height || 475)
        )}`}
        onLoadingComplete={() => {
          setIsLoading(false);
          if (onLoad) onLoad();
        }}
      />
    </div>
  );
}
