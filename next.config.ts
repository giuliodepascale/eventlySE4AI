import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lbylqyzfhepclyppwdtx.supabase.co',
        pathname: '/**',
        
      }
    ],
  },
};

export default nextConfig;

