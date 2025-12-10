import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker builds
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,

  // Deshabilitar generación estática para evitar errores con useSearchParams
  experimental: {
    // @ts-ignore
    skipTrailingSlashRedirect: true,
  },

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
