import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker builds
  // Siempre usar standalone en producción (Docker)
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  eslint: {
    // Ignorar errores de ESLint durante el build de producción
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorar errores de TypeScript durante el build de producción
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '104.250.132.28',
        port: '4000',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
