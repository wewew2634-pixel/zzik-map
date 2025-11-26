import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZZIK MAP - Discover Real Korea Through Photos',
  description: 'AI-powered K-travel discovery platform. Upload a photo, find where similar travelers went next.',
  keywords: ['Korea travel', 'AI recommendations', 'travel app', 'K-travel'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-deep-space text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
