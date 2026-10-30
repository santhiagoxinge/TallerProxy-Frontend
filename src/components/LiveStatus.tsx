import { text } from '../labels'

interface LiveStatusProps {
  error: boolean
  updatedAt: Date | null
}

const timeFormat = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

/** Pulse dot plus a ring that fills over the 3-second polling window, restarting on every refresh. */
export function LiveStatus({ error, updatedAt }: LiveStatusProps) {
  return (
    <p className={`live ${error ? 'live--off' : ''}`}>
      <span className="live__timer" role="img" aria-label={text.nextRefresh}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle className="live__timer-track" cx="12" cy="12" r="9" />
          {!error && <circle key={updatedAt?.getTime() ?? 0} className="live__timer-fill" cx="12" cy="12" r="9" pathLength={1} />}
        </svg>
        <span className="live__dot" />
      </span>
      <span>{error ? text.offline : text.live}</span>
      {updatedAt && (
        <span className="muted">
          · {text.updatedAt} {timeFormat.format(updatedAt)}
        </span>
      )}
    </p>
  )
}
