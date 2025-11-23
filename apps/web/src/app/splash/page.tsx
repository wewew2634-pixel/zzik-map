'use client'

import Link from 'next/link'

export default function SplashPage() {
  return (
    <main className="min-h-screen bg-gradient-subtle">
      <div className="flex min-h-screen flex-col items-center justify-between px-6 py-8 sm:py-12">
        {/* Header */}
        <header className="w-full max-w-md sm:max-w-lg flex items-center justify-between" role="banner">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-blue-dark flex items-center justify-center text-xs font-semibold text-white shadow-button">
              Z
            </div>
            <span className="text-sm font-semibold tracking-tight text-text-primary">
              ZZIK Map
            </span>
          </div>
          <span className="text-xs font-medium text-text-tertiary">
            v4
          </span>
        </header>

        {/* Hero Section */}
        <section className="w-full max-w-md sm:max-w-lg flex-1 flex flex-col items-center justify-center -mt-16">
          {/* Main Card */}
          <div className="w-full animate-fade-in">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-radial from-accent-blue/5 via-transparent to-transparent opacity-60" />

              {/* Content */}
              <div className="relative px-8 py-10 sm:px-10 sm:py-12">
                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-text-primary tracking-tight">
                    Real visits,
                    <br />
                    real benefits.
                  </h1>
                  <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-md">
                    실제 방문만 쌓이는 로컬 이득 맵.
                    <br />
                    <span className="text-text-tertiary">GPS · QR · Reels로 증명된 방문 데이터만 모입니다.</span>
                  </p>
                </div>

                {/* Features Grid */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {[
                    { icon: '📍', label: 'GPS 검증' },
                    { icon: '🎯', label: 'QR 인증' },
                    { icon: '🎥', label: 'Reels 증명' },
                  ].map((feature) => (
                    <div
                      key={feature.label}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg bg-surface-secondary border border-border-light transition-all duration-normal hover:shadow-sm hover:scale-105"
                    >
                      <span className="text-2xl">{feature.icon}</span>
                      <span className="text-xs font-medium text-text-secondary text-center">
                        {feature.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="w-full mt-8 space-y-3 animate-slide-up">
            <Link
              href="/login"
              className="group block w-full rounded-xl bg-accent-blue px-6 py-4 text-center text-base font-semibold text-white shadow-button transition-all duration-normal hover:bg-accent-blue-dark hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                ZZIK 시작하기
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>

            <Link
              href="/home"
              className="block w-full rounded-lg border border-border bg-surface px-6 py-3 text-center text-sm font-medium text-text-secondary transition-all duration-normal hover:border-border-dark hover:bg-surface-secondary hover:text-text-primary"
            >
              로그인 없이 둘러보기
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full max-w-md sm:max-w-lg">
          <p className="text-xs text-text-tertiary text-center leading-relaxed">
            실제 방문 인증 기반으로만 리워드가 지급됩니다.
            <br />
            <span className="text-text-tertiary/70">© 2024 ZZIK Inc. All rights reserved.</span>
          </p>
        </footer>
      </div>
    </main>
  )
}
