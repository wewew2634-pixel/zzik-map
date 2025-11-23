/**
 * Tab-Specific Loading State
 *
 * Shown during tab page transitions
 * Preserves navigation bar at bottom
 */
export default function TabLoading() {
  return (
    <div className="flex flex-col h-screen bg-zzik-bg">
      {/* Loading Content - takes available space */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          {/* Loading Spinner */}
          <div className="mb-3">
            <div className="w-10 h-10 mx-auto border-3 border-zzik-accent-gold/30 border-t-zzik-accent-gold rounded-full animate-spin" />
          </div>

          {/* Loading Text */}
          <p className="text-sm text-zzik-text-secondary">
            로딩 중...
          </p>
        </div>
      </div>

      {/* Navigation stays visible - rendered by layout */}
    </div>
  )
}
