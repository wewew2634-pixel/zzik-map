'use client'

import { useState } from 'react'
import { Card, Button } from '@zzik/ui'

// Mock user data
const mockUserData = {
  name: '단골 탐험가',
  visits: 23,
  goldPlaces: 5,
  avgLoyalty: 67,
  totalBenefit: 450,
}

export default function ProfilePage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(true)

  const handleLogout = () => {
    // TODO: Implement logout logic
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      <div className="px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="p-6 animate-fade-in">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-blue to-accent-blue-dark flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-text-primary">
                {mockUserData.name}
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                ZZIK Map 멤버
              </p>
            </div>
          </div>
        </Card>

        {/* Statistics Section */}
        <div>
          <h2 className="text-base font-semibold text-text-primary mb-3 px-2">
            나의 활동
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Visits Card */}
            <Card className="p-4 transition-all hover:scale-[1.02]">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-accent-green"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">
                    {mockUserData.visits}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    방문한 단골집
                  </p>
                </div>
              </div>
            </Card>

            {/* Gold Places Card */}
            <Card className="p-4 transition-all hover:scale-[1.02]">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-accent-amber"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">
                    {mockUserData.goldPlaces}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    GOLD 단골집
                  </p>
                </div>
              </div>
            </Card>

            {/* Average Loyalty Card */}
            <Card className="p-4 transition-all hover:scale-[1.02]">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-accent-blue"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">
                    {mockUserData.avgLoyalty}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    평균 단골지수
                  </p>
                </div>
              </div>
            </Card>

            {/* Total Benefit Card */}
            <Card className="p-4 transition-all hover:scale-[1.02]">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-secondary flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-accent-green"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">
                    {mockUserData.totalBenefit}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    총 이득 점수
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Settings Section */}
        <div>
          <h2 className="text-base font-semibold text-text-primary mb-3 px-2">
            설정
          </h2>
          <Card className="divide-y divide-border">
            {/* Notifications Setting */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    알림 설정
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    미션 및 단골집 알림
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                aria-label={notificationsEnabled ? '알림 끄기' : '알림 켜기'}
                role="switch"
                aria-checked={notificationsEnabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-accent-green' : 'bg-surface-secondary'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Dark Mode Setting */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    테마 설정
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    라이트 모드
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDarkModeEnabled(!darkModeEnabled)}
                aria-label={darkModeEnabled ? '라이트 모드로 전환' : '다크 모드로 전환'}
                role="switch"
                aria-checked={darkModeEnabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkModeEnabled ? 'bg-accent-blue' : 'bg-surface-secondary'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkModeEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Logout Button */}
            <div className="p-4">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full border-accent-red text-accent-red hover:bg-accent-red/10"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                  />
                </svg>
                로그아웃
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
