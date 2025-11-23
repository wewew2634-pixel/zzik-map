'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@zzik/ui'
import { StoreIcon, KakaoIcon, AppleIcon } from '@/components/icons'
import { Check } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'method' | 'terms' | 'processing'>('method')
  const [selectedMethod, setSelectedMethod] = useState<'kakao' | 'apple' | null>(null)
  const [agreedTerms, setAgreedTerms] = useState({
    service: false,
    privacy: false,
    marketing: false,
  })

  const allRequiredAgreed = agreedTerms.service && agreedTerms.privacy

  const handleMethodSelect = (provider: 'kakao' | 'apple') => {
    setSelectedMethod(provider)
    setStep('terms')
  }

  const handleSignup = async () => {
    if (!allRequiredAgreed || !selectedMethod) return

    setStep('processing')

    // TODO: Implement actual OAuth signup flow
    // For now, simulate signup
    setTimeout(() => {
      // Store mock token
      localStorage.setItem('zzik_auth_token', 'mock_token_' + selectedMethod)
      localStorage.setItem('zzik_auth_provider', selectedMethod)
      localStorage.setItem('zzik_is_new_user', 'true')

      // Redirect to onboarding or main
      router.push('/splash')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (step === 'terms') {
              setStep('method')
            } else {
              router.push('/')
            }
          }}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          ← 뒤로
        </button>
        {step === 'method' && (
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            이미 계정이 있나요?
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Method Selection */}
        {step === 'method' && (
          <>
            {/* App Icon */}
            <div className="mb-8 animate-fade-in">
              <StoreIcon className="w-24 h-24" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-text-primary mb-2 animate-fade-in">
              ZZIK Map 시작하기
            </h1>
            <p className="text-text-secondary text-center mb-12 animate-fade-in">
              간편하게 가입하고 단골지수를 확인하세요
            </p>

            {/* Social Signup Buttons */}
            <div className="w-full max-w-sm space-y-3 animate-slide-up">
              {/* Kakao */}
              <Button
                onClick={() => handleMethodSelect('kakao')}
                className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] font-bold py-4 text-base flex items-center justify-center gap-3 shadow-button hover:shadow-md transition-all"
              >
                <KakaoIcon className="w-6 h-6" />
                <span>카카오로 시작하기</span>
              </Button>

              {/* Apple */}
              <Button
                onClick={() => handleMethodSelect('apple')}
                className="w-full bg-text-primary hover:bg-white text-white font-bold py-4 text-base flex items-center justify-center gap-3 shadow-button hover:shadow-md transition-all"
              >
                <AppleIcon className="w-6 h-6" />
                <span>Apple로 시작하기</span>
              </Button>
            </div>
          </>
        )}

        {/* Terms Agreement */}
        {step === 'terms' && (
          <div className="w-full max-w-sm animate-slide-up">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              약관 동의
            </h2>
            <p className="text-sm text-text-secondary mb-8">
              서비스 이용을 위해 약관에 동의해주세요
            </p>

            {/* Terms list */}
            <div className="space-y-3 mb-8">
              {/* All agree */}
              <button
                type="button"
                onClick={() => {
                  const allAgreed = allRequiredAgreed && agreedTerms.marketing
                  setAgreedTerms({
                    service: !allAgreed,
                    privacy: !allAgreed,
                    marketing: !allAgreed,
                  })
                }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-surface-secondary border-2 border-accent-blue hover:bg-surface-tertiary transition-all"
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    allRequiredAgreed && agreedTerms.marketing
                      ? 'bg-accent-blue border-accent-blue'
                      : 'border-border'
                  }`}
                >
                  {allRequiredAgreed && agreedTerms.marketing && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className="text-base font-bold text-text-primary">
                  전체 동의
                </span>
              </button>

              {/* Individual terms */}
              <div className="space-y-2">
                {[
                  { key: 'service' as const, label: '(필수) 서비스 이용약관', required: true },
                  { key: 'privacy' as const, label: '(필수) 개인정보 처리방침', required: true },
                  { key: 'marketing' as const, label: '(선택) 마케팅 정보 수신', required: false },
                ].map((term) => (
                  <div
                    key={term.key}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-secondary hover:bg-surface-tertiary transition-all group"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setAgreedTerms((prev) => ({
                          ...prev,
                          [term.key]: !prev[term.key],
                        }))
                      }
                      className="flex items-center gap-3 flex-1"
                    >
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          agreedTerms[term.key]
                            ? 'bg-accent-green border-accent-green'
                            : 'border-border group-hover:border-border-dark'
                        }`}
                      >
                        {agreedTerms[term.key] && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm text-text-primary">
                        {term.label}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="ml-auto text-xs text-text-tertiary underline hover:text-text-secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Open terms detail
                      }}
                    >
                      보기
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue button */}
            <Button
              onClick={handleSignup}
              disabled={!allRequiredAgreed}
              className={`w-full py-4 text-base font-bold transition-all ${
                allRequiredAgreed
                  ? 'bg-accent-blue text-white hover:shadow-md hover:bg-accent-blue-dark'
                  : 'bg-surface-secondary text-text-tertiary cursor-not-allowed'
              }`}
            >
              가입하고 시작하기
            </Button>
          </div>
        )}

        {/* Processing */}
        {step === 'processing' && (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
            <h2 className="text-xl font-bold text-text-primary mb-2">
              가입 진행 중...
            </h2>
            <p className="text-sm text-text-secondary">
              잠시만 기다려주세요
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-xs text-text-tertiary">
          ZZIK Map v1.0.0 · © 2025 ZZIK Inc.
        </p>
      </div>
    </div>
  )
}
