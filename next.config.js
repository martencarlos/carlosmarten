// next.config.js
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_WP_URL: process.env.NEXT_PUBLIC_WP_URL,
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "", // Leave it empty unless you need a specific port
      },
      {
        protocol: "https",
        hostname: "www.carlosmarten.com",
      },
      {
        protocol: "https", // Specify the protocol (http or https)
        hostname: process.env.NEXT_PUBLIC_WP_URL, // Domain name
        port: "", // Leave this empty if there's no specific port
        pathname: "/**", // Wildcard to allow all image paths
      },
      {
        protocol: "https", // Specify the protocol (http or https)
        hostname: "rocketmedia.b-cdn.net", // Domain name
        port: "", // Leave this empty if there's no specific port
        pathname: "/**", // Wildcard to allow all image paths
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    unoptimized: true,
  },

  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
        ],
      },
    ];
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/wordpress/:path*",
  //       destination: `https://${process.env.NEXT_PUBLIC_WP_URL}/:path*`, // URL of your WordPress server
  //     },
  //   ];
  // },
};

// Use ES Modules syntax for exporting
export default nextConfig;
