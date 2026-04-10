import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
async rewrites() {
  return [
    {
      source: '/api-proxy/:path*',
      destination: 'http://localhost:3123/api/:path*',
    },
    {
     source: '/api-n8n/:path*',
     destination: 'http://localhost:5678/:path*',
    },
  ];
},
}

export default nextConfig;
