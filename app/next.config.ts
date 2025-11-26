import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  // Internationalization
  i18n: {
    locales: ['en', 'ko', 'ja', 'zh-CN', 'zh-TW', 'th'],
    defaultLocale: 'en',
  },
}

export default nextConfig
