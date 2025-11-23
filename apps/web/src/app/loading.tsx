import { Store } from 'lucide-react'

/**
 * Global Loading State
 *
 * Shown during page navigation and data loading
 * Uses Minimal Modern design system
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="text-center">
        {/* App Icon with pulse animation */}
        <div className="mb-6 animate-pulse">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-accent-blue to-accent-blue-light rounded-3xl shadow-lg flex items-center justify-center">
            <Store className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Loading Spinner */}
        <div className="mb-4">
          <div className="w-8 h-8 mx-auto border-3 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
        </div>

        {/* Loading Text */}
        <p className="text-sm text-text-secondary animate-fade-in">
          로딩 중...
        </p>
      </div>
    </div>
  )
}
