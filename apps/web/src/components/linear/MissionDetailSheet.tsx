"use client"

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from 'lucide-react'
import { Button } from '@/components/catalyst/button'
import { Badge } from '@/components/catalyst/badge'

//
// Types
//

export type MissionStep = 'gps' | 'qr' | 'reels' | 'review' | 'reward'

type StepStatus = 'pending' | 'active' | 'done'

type Step = {
  id: MissionStep
  label: string
  status: StepStatus
}

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
    placeCategory = 'Cafe',
    placeArea = 'Seongsu-dong',
    rewardAmount,
    isGold = false,
    missionConditions = 'GPS + QR + Receipt',
    timeRemaining,
    maxParticipations,
    currentStep = 'gps',
    onStart,
    onVerifyGps,
    onVerifyQr,
    onVerifyReels,
    children,
  } = props

  // Map currentStep to step statuses
  const getStepStatus = (stepId: MissionStep): StepStatus => {
    const stepOrder: MissionStep[] = ['gps', 'qr', 'reels', 'review', 'reward']
    const currentIndex = stepOrder.indexOf(currentStep)
    const stepIndex = stepOrder.indexOf(stepId)

    if (stepIndex < currentIndex) return 'done'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  const steps: Step[] = [
    { id: 'gps', label: 'GPS check', status: getStepStatus('gps') },
    { id: 'qr', label: 'QR scan', status: getStepStatus('qr') },
    { id: 'reels', label: 'Reels upload', status: getStepStatus('reels') },
    { id: 'review', label: 'Review', status: getStepStatus('review') },
    { id: 'reward', label: 'Reward', status: getStepStatus('reward') },
  ]

  // Determine primary action based on current step
  const getPrimaryAction = () => {
    switch (currentStep) {
      case 'gps':
        return {
          label: 'Start mission',
          onClick: onStart || onVerifyGps,
        }
      case 'qr':
        return {
          label: 'Scan QR code',
          onClick: onVerifyQr,
        }
      case 'reels':
        return {
          label: 'Upload verification',
          onClick: onVerifyReels,
        }
      case 'review':
        return null // No action during review
      case 'reward':
        return null // No action after completion
      default:
        return null
    }
  }

  const primaryAction = getPrimaryAction()

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Sheet Container */}
      <div className="fixed inset-0 flex items-end justify-center">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-2xl shadow-xl">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3">
            <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>

          {/* Header */}
          <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <DialogTitle className="text-base font-semibold text-zinc-900 dark:text-white">
                  {missionTitle}
                </DialogTitle>
                <p className="text-sm text-zinc-500 mt-1">
                  {placeName} · {placeArea}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Meta Badges */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge color="amber" className="text-[10px]">
                KRW {rewardAmount.toLocaleString()} reward
              </Badge>
              {isGold && (
                <Badge color="amber" className="text-[10px]">
                  Gold
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-4 space-y-4">
            {/* Mission Info */}
            {(missionConditions || timeRemaining || maxParticipations) && (
              <div className="space-y-2 text-sm">
                {missionConditions && (
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Conditions</span>
                    <span className="text-zinc-900 dark:text-white font-medium">
                      {missionConditions}
                    </span>
                  </div>
                )}
                {timeRemaining && (
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Time remaining</span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      {timeRemaining}
                    </span>
                  </div>
                )}
                {maxParticipations && (
                  <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Max participations</span>
                    <span className="text-zinc-900 dark:text-white font-medium">
                      {maxParticipations}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Steps */}
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">
                Verification steps
              </p>
              <div className="space-y-2">
                {steps.map((step) => (
                  <StepItem key={step.id} {...step} />
                ))}
              </div>
            </div>

            {/* Status Messages */}
            {currentStep === 'review' && (
              <div className="text-center py-4 space-y-2">
                <div className="text-base font-semibold text-zinc-900 dark:text-white">
                  Under review
                </div>
                <div className="text-sm text-zinc-500">
                  Your reward will be issued soon
                </div>
              </div>
            )}

            {currentStep === 'reward' && (
              <div className="text-center py-4 space-y-2">
                <div className="text-base font-bold text-green-600 dark:text-green-400">
                  Mission completed!
                </div>
                <div className="text-sm text-zinc-500">
                  KRW {rewardAmount.toLocaleString()} has been issued
                </div>
              </div>
            )}

            {/* Custom Content */}
            {children && <div>{children}</div>}

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {primaryAction && (
                <Button onClick={primaryAction.onClick} color="blue" className="w-full">
                  {primaryAction.label}
                </Button>
              )}
              <Button onClick={onClose} plain className="w-full">
                Close
              </Button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

//
// StepItem Component
//

function StepItem({ label, status }: Step) {
  const dotColor = {
    pending: 'bg-zinc-200 dark:bg-zinc-800',
    active: 'bg-blue-500',
    done: 'bg-green-500',
  }[status]

  const textColor = {
    pending: 'text-zinc-500',
    active: 'text-zinc-900 dark:text-white font-medium',
    done: 'text-zinc-600 dark:text-zinc-400',
  }[status]

  return (
    <div className="flex items-center gap-3">
      <div className={`h-2 w-2 rounded-full ${dotColor}`} />
      <span className={`text-sm ${textColor}`}>{label}</span>
    </div>
  )
}
