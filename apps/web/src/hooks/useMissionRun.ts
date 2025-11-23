import { useState, useCallback } from 'react'

//
// Types based on Prisma schema
//

export type MissionRunStatus =
  | 'PENDING_GPS'
  | 'PENDING_QR'
  | 'PENDING_REELS'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED'

export interface MissionRun {
  id: string
  missionId: string
  userId: string
  status: MissionRunStatus
  activeLockKey: string | null
  gpsVerifiedAt: string | null
  qrVerifiedAt: string | null
  reelsUploadedAt: string | null
  reviewedAt: string | null
  rejectedAt: string | null
  rewardAmount: number
  rewardedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateMissionRunPayload {
  missionId: string
}

export interface VerifyGpsPayload {
  latitude: number
  longitude: number
}

export interface VerifyQrPayload {
  qrToken: string
}

export interface VerifyReelsPayload {
  mediaUrl: string
  caption?: string
}

//
// Hook
//

export function useMissionRun() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMissionRun = useCallback(
    async (payload: CreateMissionRunPayload): Promise<MissionRun | null> => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/mission-runs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error?.message || 'Failed to create mission run')
        }

        const data = await res.json()
        return data.data as MissionRun
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getMissionRun = useCallback(
    async (id: string): Promise<MissionRun | null> => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/mission-runs/${id}`)

        if (!res.ok) {
          throw new Error('Failed to fetch mission run')
        }

        const data = await res.json()
        return data.data as MissionRun
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const verifyGps = useCallback(
    async (runId: string, payload: VerifyGpsPayload): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/mission-runs/${runId}/gps-verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error?.message || 'GPS verification failed')
        }

        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const verifyQr = useCallback(
    async (runId: string, payload: VerifyQrPayload): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/mission-runs/${runId}/qr-verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error?.message || 'QR verification failed')
        }

        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const verifyReels = useCallback(
    async (runId: string, payload: VerifyReelsPayload): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/mission-runs/${runId}/reels-verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error?.message || 'Reels verification failed')
        }

        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const approveMissionRun = useCallback(
    async (runId: string): Promise<boolean> => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/mission-runs/${runId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.error?.message || 'Mission approval failed')
        }

        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    loading,
    error,
    createMissionRun,
    getMissionRun,
    verifyGps,
    verifyQr,
    verifyReels,
    approveMissionRun,
  }
}


