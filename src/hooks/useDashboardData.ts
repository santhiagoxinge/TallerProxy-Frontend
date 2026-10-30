import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchLogs, fetchSummary } from '../api'
import type { LogEntry, LogFilters, MetricsSummary, PagedLogs, ServiceId } from '../types'
import { SERVICE_IDS } from '../types'

export const POLL_INTERVAL_MS = 3000
export const RECENT_CALLS = 20
export const PAGE_SIZE = 10

export type RecentByService = Record<ServiceId, LogEntry[]>

export interface DashboardData {
  summary: MetricsSummary | null
  recent: RecentByService | null
  logs: PagedLogs | null
  error: boolean
  loading: boolean
  updatedAt: Date | null
  refresh: () => Promise<void>
}

/**
 * Polls the backend every 3 seconds. A failed poll keeps the previous data on screen
 * and flags `error`, so the dashboard degrades to stale data instead of going blank.
 */
export function useDashboardData(filters: LogFilters, page: number): DashboardData {
  const [summary, setSummary] = useState<MetricsSummary | null>(null)
  const [recent, setRecent] = useState<RecentByService | null>(null)
  const [logs, setLogs] = useState<PagedLogs | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const latest = useRef({ filters, page })
  const requestSeq = useRef(0)

  const refresh = useCallback(async () => {
    const seq = ++requestSeq.current
    const { filters: currentFilters, page: currentPage } = latest.current
    try {
      const [nextSummary, nextLogs, ...recentPages] = await Promise.all([
        fetchSummary(),
        fetchLogs(currentFilters, currentPage, PAGE_SIZE),
        ...SERVICE_IDS.map((service) => fetchLogs({ service }, 0, RECENT_CALLS)),
      ])
      if (seq !== requestSeq.current) return
      setSummary(nextSummary)
      setLogs(nextLogs)
      setRecent(
        Object.fromEntries(SERVICE_IDS.map((id, i) => [id, recentPages[i].content])) as RecentByService,
      )
      setUpdatedAt(new Date())
      setError(false)
    } catch {
      if (seq === requestSeq.current) setError(true)
    } finally {
      if (seq === requestSeq.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    latest.current = { filters, page }
    void refresh()
    const timer = window.setInterval(() => {
      if (!document.hidden) void refresh()
    }, POLL_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [filters, page, refresh])

  return { summary, recent, logs, error, loading, updatedAt, refresh }
}
