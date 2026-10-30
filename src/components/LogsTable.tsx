import { Fragment, useState } from 'react'
import { SERVICE_LABELS, STATUS_LABELS, text } from '../labels'
import type { LogEntry, PagedLogs } from '../types'
import { AlertIcon, CheckIcon, ChevronIcon } from './Icons'

interface LogsTableProps {
  logs: PagedLogs | null
  filtersActive: boolean
  onPageChange: (page: number) => void
}

const timeFormat = new Intl.DateTimeFormat('es-CO', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

const dateTimeFormat = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'medium' })

function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2)
}

function LogDetails({ entry }: { entry: LogEntry }) {
  const params = entry.params.length === 1 ? entry.params[0] : entry.params
  const hasParams = entry.params.length > 0 && JSON.stringify(params) !== '{}'

  return (
    <div className="details">
      <dl className="details__meta">
        <div>
          <dt>{text.colRequest}</dt>
          <dd className="mono">{entry.requestId}</dd>
        </div>
        <div>
          <dt>{text.colTime}</dt>
          <dd>{dateTimeFormat.format(new Date(entry.timestamp))}</dd>
        </div>
      </dl>

      <div className="details__blocks">
        <section>
          <h4>{text.paramsTitle}</h4>
          {hasParams ? <pre>{pretty(params)}</pre> : <p className="muted">{text.noParams}</p>}
        </section>
        <section>
          <h4>{entry.status === 'ERROR' ? text.errorTitle : text.responseTitle}</h4>
          <pre className={entry.status === 'ERROR' ? 'is-error' : ''}>
            {entry.status === 'ERROR' ? entry.error : pretty(entry.response)}
          </pre>
        </section>
      </div>
    </div>
  )
}

export function LogsTable({ logs, filtersActive, onPageChange }: LogsTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (requestId: string) =>
    setExpanded((current) => {
      const next = new Set(current)
      if (!next.delete(requestId)) next.add(requestId)
      return next
    })

  if (logs && logs.content.length === 0) {
    return (
      <div className="empty">
        <p>{filtersActive ? text.logsNoMatch : text.logsEmpty}</p>
        <p className="muted">{filtersActive ? text.logsNoMatchHint : text.logsEmptyHint}</p>
      </div>
    )
  }

  return (
    <>
      <div className="table-wrap">
        <table className="logs">
          <thead>
            <tr>
              <th scope="col" className="col-toggle">
                <span className="sr-only">{text.expand}</span>
              </th>
              <th scope="col">{text.colRequest}</th>
              <th scope="col">{text.colService}</th>
              <th scope="col">{text.colOperation}</th>
              <th scope="col" className="num">
                {text.colDuration}
              </th>
              <th scope="col">{text.colStatus}</th>
              <th scope="col">{text.colTime}</th>
            </tr>
          </thead>
          <tbody>
            {(logs?.content ?? []).map((entry) => {
              const open = expanded.has(entry.requestId)
              const detailsId = `details-${entry.requestId}`
              return (
                <Fragment key={entry.requestId}>
                  <tr className={`log-row ${entry.status === 'ERROR' ? 'is-error' : ''} ${open ? 'is-open' : ''}`}>
                    <td className="col-toggle">
                      <button
                        type="button"
                        className="icon-btn"
                        aria-expanded={open}
                        aria-controls={detailsId}
                        aria-label={`${open ? text.collapse : text.expand}: ${entry.requestId}`}
                        onClick={() => toggle(entry.requestId)}
                      >
                        <span className={`chevron ${open ? 'chevron--open' : ''}`}>
                          <ChevronIcon />
                        </span>
                      </button>
                    </td>
                    <td className="mono" title={entry.requestId}>
                      {entry.requestId.slice(0, 8)}…
                    </td>
                    <td>
                      <span className="service-dot" data-service={entry.serviceId} />
                      {SERVICE_LABELS[entry.serviceId]}
                    </td>
                    <td className="mono">{entry.operation}</td>
                    <td className="num mono">
                      {entry.durationMs} {text.ms}
                    </td>
                    <td>
                      <span className={`badge ${entry.status === 'ERROR' ? 'badge--danger' : 'badge--ok'}`}>
                        {entry.status === 'ERROR' ? <AlertIcon /> : <CheckIcon />}
                        {STATUS_LABELS[entry.status]}
                      </span>
                    </td>
                    <td className="mono">{timeFormat.format(new Date(entry.timestamp))}</td>
                  </tr>
                  {open && (
                    <tr className="details-row" id={detailsId}>
                      <td colSpan={7}>
                        <LogDetails entry={entry} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {logs && (
        <nav className="pager" aria-label={text.logsTitle}>
          <span className="muted">{text.records(logs.totalElements)}</span>
          <div className="pager__controls">
            <button
              type="button"
              className="btn btn--ghost"
              disabled={logs.page <= 0}
              onClick={() => onPageChange(logs.page - 1)}
            >
              {text.previous}
            </button>
            <span aria-live="polite">{text.pageOf(logs.page + 1, Math.max(logs.totalPages, 1))}</span>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={logs.page + 1 >= logs.totalPages}
              onClick={() => onPageChange(logs.page + 1)}
            >
              {text.next}
            </button>
          </div>
        </nav>
      )}
    </>
  )
}
