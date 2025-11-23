'use client'

import { useState } from 'react'
import { MapPin, Search, Star, User } from 'lucide-react'

const navigation = [
  { name: 'Map', href: '/map', icon: MapPin, description: '단골집 탐색' },
  { name: 'Search', href: '/search', icon: Search, description: '실시간 검색' },
  { name: 'Saved', href: '/saved', icon: Star, description: '저장 목록' },
  { name: 'Profile', href: '/profile', icon: User, description: '내 정보' },
]

export default function DemoPage() {
  const [step, setStep] = useState<'landing' | 'app'>('landing')

  if (step === 'landing') {
    return (
      <main className="min-h-screen bg-gradient-subtle">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
          {/* App Icon */}
          <div className="mb-8 animate-scale-in">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-blue-dark shadow-lg flex items-center justify-center">
              <MapPin className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* App Info */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              ZZIK Map
            </h1>
            <p className="text-text-secondary">
              단골지수 기반 로컬 이득 맵
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-8 animate-slide-up">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-5 w-5 text-accent-amber fill-accent-amber" />
              ))}
            </div>
            <span className="text-text-primary font-semibold">4.8</span>
            <span className="text-text-tertiary">·</span>
            <span className="text-text-tertiary">2.3K 평가</span>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8 animate-slide-up">
            {['GPS 검증', 'QR 인증', '릴스 증명', '자동 리워드'].map((feature, i) => (
              <div
                key={feature}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border bg-surface shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-accent-green" />
                <span className="text-sm font-medium text-text-secondary">{feature}</span>
              </div>
            ))}
          </div>

          {/* Download Button */}
          <button
            onClick={() => setStep('app')}
            className="w-full max-w-md rounded-xl bg-accent-blue px-6 py-4 text-center text-base font-semibold text-white shadow-button transition-all hover:bg-accent-blue-dark hover:shadow-md hover:scale-[1.02]"
          >
            앱 둘러보기
          </button>

          {/* Info */}
          <div className="text-center space-y-1 mt-6">
            <p className="text-xs text-text-tertiary">무료 · 제공: ZZIK Inc.</p>
            <p className="text-xs text-text-tertiary">라이프스타일</p>
          </div>
        </div>
      </main>
    )
  }

  // App navigator
  return (
    <main className="min-h-screen bg-surface-secondary">
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="bg-surface border-b border-border px-6 py-4 sticky top-0 z-50 backdrop-blur-sm bg-surface/80">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-blue-dark rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-primary">ZZIK Map</h1>
                <p className="text-xs text-text-tertiary">데모 모드</p>
              </div>
            </div>
            <button
              onClick={() => setStep('landing')}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              처음으로
            </button>
          </div>
        </header>

        {/* Navigation Cards */}
        <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              모든 페이지 둘러보기
            </h2>
            <p className="text-text-secondary">
              각 카드를 클릭하여 실제 페이지로 이동하세요
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="group p-6 rounded-2xl border border-border bg-surface shadow-sm transition-all hover:shadow-md hover:scale-[1.02] hover:border-border-dark"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-surface-secondary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent-blue/10 transition-colors">
                      <Icon className="h-7 w-7 text-accent-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-text-primary mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {item.description}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-text-tertiary group-hover:text-accent-blue group-hover:translate-x-1 transition-all flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              )
            })}
          </div>

          {/* Info Card */}
          <div className="mt-8 p-6 rounded-2xl border border-accent-blue/20 bg-accent-blue/5">
            <h3 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
              데모 정보
            </h3>
            <div className="space-y-2 text-sm text-text-secondary">
              <p className="flex items-start gap-2">
                <span className="text-accent-green mt-0.5">✓</span>
                <span>4개 페이지 완성 (Map, Search, Saved, Profile)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-accent-green mt-0.5">✓</span>
                <span>미니멀 모던 디자인 시스템 적용</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-accent-green mt-0.5">✓</span>
                <span>Tailwind v4 최신 기능 활용</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-accent-green mt-0.5">✓</span>
                <span>접근성 및 반응형 완벽 지원</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-surface border-t border-border px-6 py-4 text-center">
          <p className="text-xs text-text-tertiary">
            ZZIK Map v1.0.0 · Minimal Modern Design
          </p>
        </footer>
      </div>
    </main>
  )
}
