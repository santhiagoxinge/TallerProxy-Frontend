import { useState } from 'react'
import { simulateLoad } from './api'
import { LogFilters, EMPTY_FILTERS } from './components/LogFilters'
import { LogsTable } from './components/LogsTable'
import { ResponseChart } from './components/ResponseChart'
import { ServiceCard } from './components/ServiceCard'
import { BoltIcon } from './components/Icons'
import { useDashboardData } from './hooks/useDashboardData'
import { text } from './labels'
import type { LogFilters as Filters, ServiceSummary } from './types'
import { SERVICE_IDS } from './types'

const timeFormat = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

type SimulationState = { kind: 'idle' } | { kind: 'running' } | { kind: 'done'; message: string } | { kind: 'failed' }

function emptySummary(serviceId: ServiceSummary['serviceId']): ServiceSummary {
  return { serviceId, totalCalls: 0, successCalls: 0, errorCalls: 0, errorRate: 0, averageDurationMs: 0 }
}

export default function App() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [page, setPage] = useState(0)
  const [simulation, setSimulation] = useState<SimulationState>({ kind: 'idle' })
  const { summary, recent, logs, error, loading, updatedAt, refresh } = useDashboardData(filters, page)

  const filtersActive = Object.values(filters).some(Boolean)

  const changeFilters = (next: Filters) => {
    setFilters(next)
    setPage(0)
  }

  const runSimulation = async () => {
    setSimulation({ kind: 'running' })
    try {
      const result = await simulateLoad()
      setSimulation({ kind: 'done', message: text.simulated(result.requested, result.failed) })
      await refresh()
    } catch {
      setSimulation({ kind: 'failed' })
    }
  }

  const services = SERVICE_IDS.map(
    (id) => summary?.services.find((s) => s.serviceId === id) ?? emptySummary(id),
  )

  return (
    <>
      <div className="backdrop" aria-hidden="true">
        <span className="orb orb--cyan" />
        <span className="orb orb--amber" />
        <span className="orb orb--blue" />
      </div>

      <main className="shell">
        <header className="topbar glass">
          <div>
            <h1>{text.appName}</h1>
            <p className="panel__sub">{text.appTagline}</p>
          </div>

          <div className="topbar__actions">
            <p className={`live ${error ? 'live--off' : ''}`}>
              <span className="live__dot" aria-hidden="true" />
              {text.live}
              {updatedAt && (
                <span className="muted">
                  {' · '}
                  {text.updatedAt} {timeFormat.format(updatedAt)}
                </span>
              )}
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={runSimulation}
              disabled={simulation.kind === 'running'}
            >
              <BoltIcon />
              {simulation.kind === 'running' ? text.simulating : text.simulate}
            </button>
          </div>
        </header>

        <p className="status-line" role="status" aria-live="polite">
          {simulation.kind === 'done' && simulation.message}
          {simulation.kind === 'failed' && <span className="text-danger">{text.simulateFailed}</span>}
        </p>

        {error && (
          <div className="banner" role="alert">
            <span>
              {text.loadError} {summary && text.loadErrorStale}
            </span>
            <button type="button" className="btn btn--ghost" onClick={() => void refresh()}>
              {text.retry}
            </button>
          </div>
        )}

        {loading && !summary ? (
          <p className="loading" role="status">
            {text.loading}
          </p>
        ) : (
          <>
            <section className="cards" aria-label={text.appName}>
              {services.map((service) => (
                <ServiceCard key={service.serviceId} summary={service} />
              ))}
            </section>

            <ResponseChart recent={recent} />

            <section className="glass panel" aria-labelledby="logs-title">
              <header className="panel__head panel__head--stack">
                <h2 id="logs-title">{text.logsTitle}</h2>
                <LogFilters filters={filters} onChange={changeFilters} />
              </header>
              <LogsTable logs={logs} filtersActive={filtersActive} onPageChange={setPage} />
            </section>
          </>
        )}
      </main>
    </>
  )
}
