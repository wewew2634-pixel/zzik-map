import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/providers/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZZIK MAP - Discover Real Korea Through Photos',
  description: 'AI-powered K-travel discovery platform. Upload a photo, find where similar travelers went next.',
  keywords: ['Korea travel', 'AI recommendations', 'travel app', 'K-travel'],
  openGraph: {
    title: 'ZZIK MAP',
    description: 'With one photo, know where 847 travelers went next',
    type: 'website',
  },
  /* P0-3: Font loading optimization headers */
  other: {
    'preload-prefetch': 'dns-prefetch',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0A1628',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Default to 'en' locale - can be overridden by locale-specific layout at [locale]/layout.tsx
  const locale = 'en';

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* CRITICAL FIX: Font Performance Optimization Headers */}
        {/* DNS Prefetch for font CDNs */}
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

        {/* Preconnect to font servers (TCP handshake + TLS negotiation) */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />

        {/* Preload critical font (Pretendard Variable for all languages) */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendard-variable.woff2"
          crossOrigin="anonymous"
        />

        {/* Preload language-specific fonts to prevent FOIT */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://fonts.gstatic.com/s/notosansjp/v52/-F6ofjtqLzI2JPCgQBnw7zBgdxb6Xw.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://fonts.gstatic.com/s/notosanssc/v37/PrZc-fdhzDxn5ESr1WQKAY2l0wdM_eCo8XKDH_P3aEw.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://fonts.gstatic.com/s/notosanstc/v37/PrZf-fdhzDxn5ESr1WQKAY2l0wdM_dCaO23KHDS3aEw.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="https://fonts.gstatic.com/s/notosansthai/v28/PlIpFj_0v-P1MnLhf-p4M5BIGMhGTrjCMa8ow0lDDww.woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-deep-space text-white min-h-screen antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
