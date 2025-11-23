import { cn } from '../lib/utils'
import { triggerHaptic } from '../lib/haptics'

//
// Types
//

export type MissionStep = 'gps' | 'qr' | 'reels' | 'review' | 'reward'

export interface MissionDetailSheetProps {
  open: boolean
  onClose: () => void
  missionTitle: string
  placeName: string
  placeCategory?: string
  placeArea?: string
  rewardAmount: number
  isGold?: boolean
  missionConditions?: string
  timeRemaining?: string
  maxParticipations?: number
  currentStep?: MissionStep
  onStart?: () => void
  onVerifyGps?: () => void
  onVerifyQr?: () => void
  onVerifyReels?: () => void
  children?: React.ReactNode
}

//
// Component
//

export function MissionDetailSheet(props: MissionDetailSheetProps) {
  const {
    open,
    onClose,
    missionTitle,
    placeName,
    placeCategory = '카페',
    placeArea = '성수동',
    rewardAmount,
    isGold = false,
    missionConditions = 'GPS + QR + 영수증',
    timeRemaining,
    maxParticipations,
    currentStep = 'gps',
    onStart,
    onVerifyGps,
    onVerifyQr,
    onVerifyReels,
    children,
  } = props

  if (!open) return null

  const steps: { id: MissionStep; label: string; completed: boolean }[] = [
    { id: 'gps', label: 'GPS', completed: currentStep !== 'gps' },
    { id: 'qr', label: 'QR', completed: ['reels', 'review', 'reward'].includes(currentStep) },
    { id: 'reels', label: 'Reels', completed: ['review', 'reward'].includes(currentStep) },
    { id: 'review', label: 'Review', completed: currentStep === 'reward' },
    { id: 'reward', label: 'Reward', completed: false },
  ]

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm',
          'z-50 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={cn(
          'fixed inset-x-4 bottom-4',
          'bg-white/95 dark:bg-zinc-900/95',
          'border border-zinc-200 dark:border-zinc-800',
          'rounded-xl',
          'shadow-lg',
          'backdrop-blur-lg',
          'z-50',
          'transition-all duration-300',
          'max-h-[85vh] overflow-y-auto',
          open
            ? 'translate-y-0 opacity-100'
            : 'translate-y-8 opacity-0 pointer-events-none'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-title"
      >
        {/* Handle bar */}
        <div className="flex justify-center py-3 sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-10">
          <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-6">
          {/* Header */}
          <div className="space-y-3 animate-fade-in">
            {/* Title */}
            <h2
              id="mission-title"
              className="text-2xl font-bold text-zinc-900 dark:text-white"
            >
              {missionTitle}
            </h2>

            {/* Place info */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                {placeName}
              </span>
              {isGold && (
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/40">
                  GOLD
                </span>
              )}
              <span className="text-xs text-zinc-500">
                {placeCategory} · {placeArea}
              </span>
            </div>

            {/* Reward badge */}
            <div className="inline-flex items-center rounded-full bg-amber-500 px-4 py-1.5 text-sm font-bold text-white">
              {rewardAmount.toLocaleString()}원 리워드
            </div>
          </div>

          {/* Meta info */}
          <div className="space-y-2 text-sm animate-slide-up">
            <div className="flex items-center justify-between text-zinc-500">
              <span>미션 조건</span>
              <span className="text-zinc-900 dark:text-white font-medium">
                {missionConditions}
              </span>
            </div>
            {timeRemaining && (
              <div className="flex items-center justify-between text-zinc-500">
                <span>남은 시간</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {timeRemaining}
                </span>
              </div>
            )}
            {maxParticipations && (
              <div className="flex items-center justify-between text-zinc-500">
                <span>최대 참여 횟수</span>
                <span className="text-zinc-900 dark:text-white font-medium">
                  {maxParticipations}회
                </span>
              </div>
            )}
          </div>

          {/* Progress Stepper */}
          <div className="space-y-3 animate-slide-up">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              미션 진행 단계
            </h3>
            <div className="flex items-center justify-between gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Step circle */}
                  <div
                    className={cn(
                      'flex items-center justify-center',
                      'w-10 h-10 rounded-full',
                      'text-xs font-semibold',
                      'transition-all duration-200',
                      step.completed
                        ? 'bg-green-500 text-white'
                        : step.id === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                    )}
                  >
                    {step.completed ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.label
                    )}
                  </div>

                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-1',
                        'transition-colors duration-200',
                        step.completed
                          ? 'bg-green-500'
                          : 'bg-zinc-200 dark:bg-zinc-700'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-2 animate-slide-up">
            {currentStep === 'gps' && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('heavy')
                  ;(onStart || onVerifyGps)?.()
                }}
                className={cn(
                  'w-full py-4 px-6 rounded-lg',
                  'bg-blue-500 text-white',
                  'font-bold text-base',
                  'hover:bg-blue-600',
                  'active:bg-blue-700',
                  'transition-all duration-150'
                )}
              >
                이득 받기
              </button>
            )}

            {currentStep === 'qr' && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium')
                  onVerifyQr?.()
                }}
                className={cn(
                  'w-full py-4 px-6 rounded-lg',
                  'bg-blue-500 text-white',
                  'font-bold text-base',
                  'hover:bg-blue-600',
                  'active:bg-blue-700',
                  'transition-all duration-150'
                )}
              >
                QR 코드 스캔하기
              </button>
            )}

            {currentStep === 'reels' && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium')
                  onVerifyReels?.()
                }}
                className={cn(
                  'w-full py-4 px-6 rounded-lg',
                  'bg-blue-500 text-white',
                  'font-bold text-base',
                  'hover:bg-blue-600',
                  'active:bg-blue-700',
                  'transition-all duration-150'
                )}
              >
                인증 사진 업로드하기
              </button>
            )}

            {currentStep === 'review' && (
              <div className="text-center py-4">
                <div className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                  검토 중입니다
                </div>
                <div className="text-sm text-zinc-500">
                  곧 리워드가 지급됩니다
                </div>
              </div>
            )}

            {currentStep === 'reward' && (
              <div className="text-center py-4">
                <div className="mb-2 flex justify-center">
                  <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">
                  미션 완료!
                </div>
                <div className="text-sm text-zinc-500">
                  {rewardAmount.toLocaleString()}원이 지급되었습니다
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light')
                onClose?.()
              }}
              className={cn(
                'w-full py-3 px-6 rounded-lg',
                'bg-transparent text-zinc-500',
                'border border-zinc-200 dark:border-zinc-700',
                'font-medium text-sm',
                'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                'transition-all duration-150'
              )}
            >
              닫기
            </button>
          </div>

          {/* Optional custom content */}
          {children && (
            <div className="animate-fade-in">
              {children}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
