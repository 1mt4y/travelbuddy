import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  // Disable React StrictMode to prevent double-mounting in development,
  // which can lead to duplicate Prisma connections
  reactStrictMode: false,

  // Add runtime config for your database connection, if needed
  // (keep database connection string in .env only)
  publicRuntimeConfig: {
    // Any public runtime configs can go here
  },

  serverRuntimeConfig: {
    // Any server-only runtime configs can go here
  },

  // Add any other necessary configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

};

export default nextConfig;
