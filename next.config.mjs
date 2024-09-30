

  // next.config.js

  export default {
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
  