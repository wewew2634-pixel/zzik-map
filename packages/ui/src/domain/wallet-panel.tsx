import { cn } from '../lib/utils'

//
// Types
//

export type TransactionType = 'MISSION_REWARD' | 'ADJUSTMENT' | 'WITHDRAWAL' | 'DEPOSIT' | 'REFUND'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export interface Transaction {
  id: string
  type: TransactionType
  status: TransactionStatus
  amount: number
  balanceBefore: number
  balanceAfter: number
  description?: string
  createdAt: string
}

export interface WalletPanelProps {
  balance: number
  lockedBalance?: number
  transactions?: Transaction[]
  onWithdraw?: () => void
  className?: string
}

//
// Helper Functions
//

function getTransactionIcon(type: TransactionType): React.ReactNode {
  switch (type) {
    case 'MISSION_REWARD':
      return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
    case 'WITHDRAWAL':
      return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    case 'DEPOSIT':
      return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    case 'ADJUSTMENT':
      return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    case 'REFUND':
      return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
    default:
      return <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
  }
}

function getTransactionLabel(type: TransactionType): string {
  switch (type) {
    case 'MISSION_REWARD':
      return '미션 리워드'
    case 'WITHDRAWAL':
      return '출금'
    case 'DEPOSIT':
      return '입금'
    case 'ADJUSTMENT':
      return '조정'
    case 'REFUND':
      return '환불'
    default:
      return '거래'
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
}

//
// Component
//

export function WalletPanel(props: WalletPanelProps) {
  const {
    balance,
    lockedBalance = 0,
    transactions = [],
    onWithdraw,
    className,
  } = props

  const hasTransactions = transactions.length > 0

  return (
    <div
      className={cn(
        'bg-zzik-surface-content',
        'border border-zzik-border-content',
        'rounded-zzik-depth-lg',
        'shadow-zzik-depth-elevation-02',
        'z-zzik-depth-02',
        'animate-zzik-slide-up',
        className
      )}
    >
      {/* Balance Section */}
      <div className="p-6 border-b border-zzik-border-content">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-sm text-zzik-text-secondary mb-1">
              보유 포인트
            </div>
            <div className="text-3xl font-bold text-zzik-text-primary">
              {balance.toLocaleString()}
              <span className="text-lg text-zzik-text-secondary ml-1">원</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-400 rounded-lg flex items-center justify-center shadow-md">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {lockedBalance > 0 && (
          <div className="text-xs text-zzik-text-muted">
            출금 대기 중: {lockedBalance.toLocaleString()}원
          </div>
        )}

        {onWithdraw && (
          <button
            type="button"
            onClick={onWithdraw}
            className={cn(
              'w-full mt-4 py-3 px-4 rounded-zzik-depth-md',
              'bg-zzik-surface-floating text-zzik-text-primary',
              'border border-zzik-border-content',
              'font-medium text-sm',
              'hover:bg-zzik-surface-highlight',
              'hover:shadow-zzik-depth-elevation-02',
              'active:scale-zzik-press',
              'transition-all duration-zzik-fast'
            )}
          >
            출금하기
          </button>
        )}
      </div>

      {/* Transactions Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-zzik-text-primary">
            거래 내역
          </h3>
          {hasTransactions && (
            <span className="text-xs text-zzik-text-muted">
              최근 {transactions.length}건
            </span>
          )}
        </div>

        {hasTransactions ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-zzik-depth-sm',
                  'bg-zzik-surface-floating',
                  'border border-zzik-border-content',
                  'hover:border-zzik-border-floating',
                  'transition-all duration-zzik-fast'
                )}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 bg-zzik-surface-content rounded-full flex items-center justify-center text-zzik-text-primary">
                  {getTransactionIcon(tx.type)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zzik-text-primary">
                      {getTransactionLabel(tx.type)}
                    </span>
                    {tx.status === 'PENDING' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-zzik-accent-yellow/20 text-zzik-accent-yellow border border-zzik-accent-yellow/40">
                        대기 중
                      </span>
                    )}
                    {tx.status === 'FAILED' && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-zzik-accent-red/20 text-zzik-accent-red border border-zzik-accent-red/40">
                        실패
                      </span>
                    )}
                  </div>
                  {tx.description && (
                    <div className="text-xs text-zzik-text-muted truncate mt-0.5">
                      {tx.description}
                    </div>
                  )}
                  <div className="text-xs text-zzik-text-muted mt-0.5">
                    {formatDate(tx.createdAt)}
                  </div>
                </div>

                {/* Amount */}
                <div className="flex-shrink-0 text-right">
                  <div
                    className={cn(
                      'text-base font-bold',
                      tx.amount > 0 ? 'text-zzik-accent-green' : 'text-zzik-accent-red'
                    )}
                  >
                    {tx.amount > 0 ? '+' : ''}
                    {tx.amount.toLocaleString()}원
                  </div>
                  <div className="text-[10px] text-zzik-text-muted mt-0.5">
                    잔액: {tx.balanceAfter.toLocaleString()}원
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-3 flex justify-center">
              <svg className="h-16 w-16 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="text-sm text-zzik-text-secondary mb-1">
              아직 거래 내역이 없습니다
            </div>
            <div className="text-xs text-zzik-text-muted">
              미션을 완료하고 리워드를 받아보세요
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
