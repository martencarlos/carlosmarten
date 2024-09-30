  
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  env: {
      NEXT_PUBLIC_WP_URL: process.env.NEXT_PUBLIC_WP_URL,
    },
  images: {
    remotePatterns: [
      {
        protocol: 'https',  // Specify the protocol (http or https)
        hostname: process.env.NEXT_PUBLIC_WP_URL,  // Domain name
        port: '',  // Leave this empty if there's no specific port
        pathname: '/**',  // Wildcard to allow all image paths
      },
    ],
  },
};

// Use ES Modules syntax for exporting
export default nextConfig;