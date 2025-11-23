"use client"

import { Badge } from '@/components/catalyst/badge'
import { TrendingUp, Gift, ArrowUpRight, ArrowDownLeft, Settings, RotateCcw, CreditCard } from 'lucide-react'

type TransactionType = 'MISSION_REWARD' | 'ADJUSTMENT' | 'WITHDRAWAL' | 'DEPOSIT' | 'REFUND'
type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

type Transaction = {
  id: string
  type: TransactionType
  status: TransactionStatus
  amount: number
  balanceBefore: number
  balanceAfter: number
  description?: string
  createdAt: string
}

type WalletPanelProps = {
  balance: number
  lockedBalance?: number
  transactions?: Transaction[]
  onWithdraw?: () => void
  className?: string
}

function getTransactionIcon(type: TransactionType) {
  switch (type) {
    case 'MISSION_REWARD':
      return Gift
    case 'WITHDRAWAL':
      return ArrowUpRight
    case 'DEPOSIT':
      return ArrowDownLeft
    case 'ADJUSTMENT':
      return Settings
    case 'REFUND':
      return RotateCcw
    default:
      return CreditCard
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

export function WalletPanel({ balance, lockedBalance = 0, transactions = [], onWithdraw, className }: WalletPanelProps) {
  const hasTransactions = transactions.length > 0

  // Calculate monthly earned (sum of positive transactions this month)
  const monthlyEarned = transactions
    .filter((tx) => {
      const txDate = new Date(tx.createdAt)
      const now = new Date()
      return txDate.getMonth() === now.getMonth() &&
             txDate.getFullYear() === now.getFullYear() &&
             tx.amount > 0
    })
    .reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <section className={`border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden ${className || ''}`}>
      {/* Header */}
      <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-zinc-500 mb-1">보유 포인트</p>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">
              {balance.toLocaleString()}
              <span className="text-base text-zinc-500 ml-1.5">원</span>
            </p>
            {monthlyEarned > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <TrendingUp className="h-3.5 w-3.5 text-green-500" strokeWidth={2} />
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {monthlyEarned.toLocaleString()}원 이번 달
                </p>
              </div>
            )}
            {lockedBalance > 0 && (
              <p className="text-xs text-zinc-500 mt-1">
                출금 대기 중: {lockedBalance.toLocaleString()}원
              </p>
            )}
          </div>
        </div>

        {onWithdraw && (
          <button
            type="button"
            onClick={onWithdraw}
            className="w-full mt-4 py-2.5 px-4 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 font-medium text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            출금하기
          </button>
        )}
      </div>

      {/* Transactions */}
      <div>
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-white">
              거래 내역
            </h3>
            {hasTransactions && (
              <span className="text-xs text-zinc-500">
                최근 {transactions.length}건
              </span>
            )}
          </div>
        </div>

        {hasTransactions ? (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {transactions.map((tx) => {
              const Icon = getTransactionIcon(tx.type)
              return (
                <div key={tx.id} className="px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                      <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" strokeWidth={1.5} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {getTransactionLabel(tx.type)}
                        </p>
                        {tx.status === 'PENDING' && (
                          <Badge color="amber" className="text-[10px]">
                            대기 중
                          </Badge>
                        )}
                        {tx.status === 'FAILED' && (
                          <Badge color="red" className="text-[10px]">
                            실패
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {tx.description && (
                          <>
                            <p className="text-xs text-zinc-500 truncate">
                              {tx.description}
                            </p>
                            <span className="text-xs text-zinc-400">·</span>
                          </>
                        )}
                        <p className="text-xs text-zinc-500">
                          {formatDate(tx.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex-shrink-0 text-right">
                      <p className={`text-sm font-semibold ${
                        tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-zinc-600 dark:text-zinc-400'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}원
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        잔액: {tx.balanceAfter.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-4 py-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-zinc-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-zinc-900 dark:text-white font-medium mb-1">
              아직 거래 내역이 없습니다
            </p>
            <p className="text-xs text-zinc-500">
              미션을 완료하고 리워드를 받아보세요
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
