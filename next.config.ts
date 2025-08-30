import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // Enable server actions (correct format for Next.js 15)
  },
  
  // Server external packages (moved from experimental in Next.js 15)
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Configure headers for CORS
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  
  // Allow cross-origin requests in development
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://192.168.56.1:3000',
    'http://192.168.56.1:3001',
  ],
};

export default nextConfig;
