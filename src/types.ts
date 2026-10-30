export const SERVICE_IDS = ['inventory', 'orders', 'payments'] as const

export type ServiceId = (typeof SERVICE_IDS)[number]
export type CallStatus = 'SUCCESS' | 'ERROR'

export interface LogEntry {
  requestId: string
  serviceId: ServiceId
  operation: string
  durationMs: number
  status: CallStatus
  timestamp: string
  params: unknown[]
  response: unknown
  error: string | null
}

export interface ServiceSummary {
  serviceId: ServiceId
  totalCalls: number
  successCalls: number
  errorCalls: number
  errorRate: number
  averageDurationMs: number
}

export interface MetricsSummary {
  totalCalls: number
  errorRate: number
  averageDurationMs: number
  services: ServiceSummary[]
}

export interface PagedLogs {
  content: LogEntry[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface LogFilters {
  service: ServiceId | ''
  status: CallStatus | ''
  from: string
  to: string
}

export interface LoadResult {
  requested: number
  succeeded: number
  failed: number
}
