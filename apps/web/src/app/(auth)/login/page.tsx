'use client'

import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const handleGuestLogin = () => {
    localStorage.setItem('zzik_auth_token', 'mock_token_guest')
    localStorage.setItem('zzik_auth_provider', 'guest')
    router.push('/home')
  }

  return (
    <main className="min-h-screen bg-gradient-subtle">
      <div className="flex min-h-screen flex-col items-center px-6 py-8">
        {/* Header */}
        <header className="w-full max-w-md">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로
          </button>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md -mt-16">
          <section className="w-full space-y-6 animate-fade-in">
            {/* Title */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">
                로그인하고
                <br />
                내 방문 리워드를 관리하세요.
              </h1>
              <p className="text-sm text-text-secondary leading-relaxed">
                한 번 로그인하면, 각 미션의 실행 기록과 리워드 적립 내역이
                디바이스/계정에 안전하게 저장됩니다.
              </p>
            </div>

            {/* Login Panel */}
            <div className="rounded-2xl border border-border bg-surface shadow-elevated p-6">
              <div className="space-y-3">
                {/* Social Login Buttons */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm font-medium text-text-primary transition-all hover:bg-surface-tertiary hover:border-border-dark"
                >
                  <span className="text-lg">💬</span>
                  카카오로 계속하기
                </button>

                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 rounded-lg border border-border bg-surface-secondary px-4 py-3 text-sm font-medium text-text-primary transition-all hover:bg-surface-tertiary hover:border-border-dark"
                >
                  <span className="text-lg"></span>
                  Apple로 계속하기
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-text-tertiary">또는</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Guest Login */}
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="w-full rounded-lg bg-accent-blue px-4 py-3 text-sm font-semibold text-white shadow-button transition-all hover:bg-accent-blue-dark hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                  게스트로 먼저 둘러보기
                </button>
              </div>
            </div>

            {/* Terms */}
            <footer className="text-xs text-text-tertiary text-center leading-relaxed">
              계속 진행하면{' '}
              <a href="#" className="underline hover:text-text-secondary transition-colors">
                이용약관
              </a>
              과{' '}
              <a href="#" className="underline hover:text-text-secondary transition-colors">
                개인정보 처리방침
              </a>
              에 동의한 것으로 간주됩니다.
            </footer>
          </section>
        </div>
      </div>
    </main>
  )
}
