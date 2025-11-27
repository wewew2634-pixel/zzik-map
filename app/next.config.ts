import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Performance optimizations
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false, // Security: hide X-Powered-By header

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    // Modern image formats
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Performance: 1 year cache TTL for optimized images (31536000 seconds)
    minimumCacheTTL: 31536000,
  },

  // Security headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(self)',
        },
      ],
    },
  ],

  // Experimental features for performance
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['framer-motion', 'lucide-react', '@supabase/supabase-js'],
  },
}

export default nextConfig
