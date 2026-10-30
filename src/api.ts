import type { LoadResult, LogFilters, MetricsSummary, PagedLogs } from './types'

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, init)
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  return response.json() as Promise<T>
}

export function fetchSummary(): Promise<MetricsSummary> {
  return request('/api/metrics/summary')
}

export function fetchLogs(filters: Partial<LogFilters>, page: number, size: number): Promise<PagedLogs> {
  const query = new URLSearchParams({ page: String(page), size: String(size) })
  if (filters.service) query.set('service', filters.service)
  if (filters.status) query.set('status', filters.status)
  if (filters.from) query.set('from', new Date(filters.from).toISOString())
  if (filters.to) query.set('to', new Date(filters.to).toISOString())
  return request(`/api/metrics/logs?${query}`)
}

export function simulateLoad(): Promise<LoadResult> {
  return request('/api/metrics/simulate-load', { method: 'POST' })
}
