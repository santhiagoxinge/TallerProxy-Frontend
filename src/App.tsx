import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import { simulateLoad } from './api'
import { Backdrop } from './components/Backdrop'
import { BoltIcon, SpinnerIcon } from './components/Icons'
import { LiveStatus } from './components/LiveStatus'
import { LogFilters, EMPTY_FILTERS } from './components/LogFilters'
import { LogsTable } from './components/LogsTable'
import { MagneticButton } from './components/MagneticButton'
import { ResponseChart } from './components/ResponseChart'
import { ServiceCard } from './components/ServiceCard'
import { Toast } from './components/Toast'
import type { ToastMessage } from './components/Toast'
import { useDashboardData } from './hooks/useDashboardData'
import { useSpecular } from './hooks/useSpecular'
import { text } from './labels'
import { materialize, stagger } from './motion'
import type { LogFilters as Filters, ServiceId, ServiceSummary } from './types'
import { SERVICE_IDS } from './types'

function emptySummary(serviceId: ServiceId): ServiceSummary {
  return { serviceId, totalCalls: 0, successCalls: 0, errorCalls: 0, errorRate: 0, averageDurationMs: 0 }
}

export default function App() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [page, setPage] = useState(0)
  const [running, setRunning] = useState(false)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [hidden, setHidden] = useState<ReadonlySet<ServiceId>>(new Set())
  const toastId = useRef(0)
  const logsSpecular = useSpecular<HTMLElement>()

  const { summary, recent, logs, error, loading, updatedAt, refresh } = useDashboardData(filters, page)
  const filtersActive = Object.values(filters).some(Boolean)

  const changeFilters = (next: Filters) => {
    setFilters(next)
    setPage(0)
  }

  const selectService = (id: ServiceId) => changeFilters({ ...filters, service: filters.service === id ? '' : id })

  const toggleSeries = (id: ServiceId) =>
    setHidden((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })

  const notify = useCallback((kind: ToastMessage['kind'], message: string) => {
    setToast({ id: ++toastId.current, kind, message })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const runSimulation = async () => {
    setRunning(true)
    try {
      const result = await simulateLoad()
      notify('success', text.simulated(result.requested, result.failed))
      await refresh()
    } catch {
      notify('error', text.simulateFailed)
    } finally {
      setRunning(false)
    }
  }

  const services = SERVICE_IDS.map((id) => summary?.services.find((s) => s.serviceId === id) ?? emptySummary(id))

  return (
    <MotionConfig reducedMotion="user">
      <Backdrop />

      <main className="shell">
        <motion.header className="topbar glass" variants={materialize} initial="hidden" animate="show">
          <div>
            <h1>{text.appName}</h1>
            <p className="panel__sub">{text.appTagline}</p>
          </div>

          <div className="topbar__actions">
            <LiveStatus error={error} updatedAt={updatedAt} />
            <MagneticButton onClick={runSimulation} disabled={running} aria-busy={running}>
              {running ? <SpinnerIcon /> : <BoltIcon />}
              {running ? text.simulating : text.simulate}
            </MagneticButton>
          </div>
        </motion.header>

        <AnimatePresence>
          {error && (
            <motion.div
              className="banner"
              role="alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <span>
                {text.loadError} {summary && text.loadErrorStale}
              </span>
              <button type="button" className="btn btn--ghost" onClick={() => void refresh()}>
                {text.retry}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && !summary ? (
          <div className="cards" role="status" aria-label={text.loading}>
            {SERVICE_IDS.map((id) => (
              <div key={id} className="glass skeleton" />
            ))}
          </div>
        ) : (
          <motion.div className="stack" variants={stagger} initial="hidden" animate="show">
            <motion.section className="cards" variants={stagger} aria-label={text.appName}>
              {services.map((service) => (
                <motion.div key={service.serviceId} variants={materialize} className="card-slot">
                  <ServiceCard
                    summary={service}
                    selected={filters.service === service.serviceId}
                    onSelect={() => selectService(service.serviceId)}
                  />
                </motion.div>
              ))}
            </motion.section>

            <motion.div variants={materialize}>
              <ResponseChart recent={recent} hidden={hidden} focus={filters.service} onToggleSeries={toggleSeries} />
            </motion.div>

            <motion.section
              ref={logsSpecular.ref}
              onPointerMove={logsSpecular.onPointerMove}
              variants={materialize}
              className="glass panel"
              aria-labelledby="logs-title"
            >
              <header className="panel__head panel__head--stack">
                <h2 id="logs-title">{text.logsTitle}</h2>
                <LogFilters filters={filters} onChange={changeFilters} />
              </header>
              <LogsTable logs={logs} filtersActive={filtersActive} onPageChange={setPage} />
            </motion.section>
          </motion.div>
        )}
      </main>

      <Toast toast={toast} onDismiss={dismissToast} />
    </MotionConfig>
  )
}
