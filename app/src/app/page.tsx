export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-zzik-coral">ZZIK</span> MAP
        </h1>

        <p className="text-xl text-gray-300 mb-8">
          With one photo, know where similar travelers went next
        </p>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <p className="text-electric-cyan text-lg mb-4">
            Coming Soon
          </p>
          <p className="text-gray-400">
            AI-powered K-travel discovery platform
          </p>
        </div>

        <div className="mt-12 flex gap-4 justify-center text-sm text-gray-500">
          <span>Journey Intelligence</span>
          <span>|</span>
          <span>Vibe Matching</span>
          <span>|</span>
          <span>MAP BOX</span>
        </div>
      </div>
    </main>
  )
}
