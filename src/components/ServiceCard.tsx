import { ERROR_RATE_THRESHOLD, SERVICE_LABELS, text } from '../labels'
import type { ServiceSummary } from '../types'
import { AlertIcon, CheckIcon } from './Icons'

interface ServiceCardProps {
  summary: ServiceSummary
}

export function ServiceCard({ summary }: ServiceCardProps) {
  const hasCalls = summary.totalCalls > 0
  const unhealthy = hasCalls && summary.errorRate > ERROR_RATE_THRESHOLD
  const successRate = hasCalls ? 100 - summary.errorRate : null

  return (
    <article
      className={`glass service-card ${unhealthy ? 'is-unhealthy' : ''}`}
      data-service={summary.serviceId}
    >
      <header className="service-card__head">
        <h3>{SERVICE_LABELS[summary.serviceId]}</h3>
        {hasCalls && (
          <span className={`badge ${unhealthy ? 'badge--danger' : 'badge--ok'}`}>
            {unhealthy ? <AlertIcon /> : <CheckIcon />}
            {unhealthy ? text.unhealthy : text.healthy}
          </span>
        )}
      </header>

      <p className="service-card__total">
        <span className="metric-value">{summary.totalCalls}</span>
        <span className="metric-label">{text.totalCalls}</span>
      </p>

      <dl className="service-card__stats">
        <div>
          <dt>{text.successRate}</dt>
          <dd>{successRate === null ? '—' : `${successRate.toFixed(1)}%`}</dd>
        </div>
        <div>
          <dt>{text.avgTime}</dt>
          <dd>{hasCalls ? `${Math.round(summary.averageDurationMs)} ${text.ms}` : '—'}</dd>
        </div>
      </dl>

      <div className="meter" role="presentation">
        <span style={{ width: `${successRate ?? 0}%` }} />
      </div>
    </article>
  )
}
