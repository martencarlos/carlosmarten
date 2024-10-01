  
// next.config.js
const nextConfig = {
  reactStrictMode: false,
  env: {
      NEXT_PUBLIC_WP_URL: process.env.NEXT_PUBLIC_WP_URL,
    },
  images: {
    remotePatterns: [
       {
        protocol: 'http',
        hostname: 'localhost',
        port: '', // Leave it empty unless you need a specific port
      },
      {
        protocol: 'https',
        hostname: 'www.carlosmarten.com',
      },
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