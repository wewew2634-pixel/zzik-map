import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ZZIK MAP - Discover Real Korea Through Photos',
  description: 'AI-powered K-travel discovery platform. Upload your photo and discover where similar travelers went next.',
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--deep-space)]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--deep-space)]/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                <span className="text-[var(--zzik-coral)]">ZZIK</span>
                <span className="text-white"> MAP</span>
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/journey" className="text-white/80 hover:text-white transition-colors font-medium">
                Journey
              </Link>
              <Link href="/explore" className="text-white/80 hover:text-white transition-colors font-medium">
                Explore
              </Link>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <Link
                href="/journey"
                className="px-4 py-2 bg-[var(--zzik-coral)] hover:bg-[var(--zzik-coral)]/90 text-white font-medium rounded-lg transition-colors"
              >
                Upload Photo
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content with top padding for fixed nav */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-500 text-sm">
              ZZIK MAP - Discover Real Korea Through Photos
            </p>
            <p className="text-zinc-600 text-xs">
              Powered by Gemini AI & Crowd Wisdom
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
