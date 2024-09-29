

  // next.config.js
  export default {
    images: {
      remotePatterns: [
        {
          protocol: 'https',  // Specify the protocol (http or https)
          hostname: 'www.carlosmarten.com',  // Domain name
          port: '',  // Leave this empty if there's no specific port
          pathname: '/**',  // Wildcard to allow all image paths
        },
      ],
    },
  };
  