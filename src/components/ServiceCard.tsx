import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import type { PointerEvent } from 'react'
import { useSpecular } from '../hooks/useSpecular'
import { ERROR_RATE_THRESHOLD, SERVICE_LABELS, text } from '../labels'
import { SPRING_TILT } from '../motion'
import type { ServiceSummary } from '../types'
import { AnimatedNumber } from './AnimatedNumber'
import { AlertIcon, CheckIcon } from './Icons'
import { RingGauge } from './RingGauge'

interface ServiceCardProps {
  summary: ServiceSummary
  selected: boolean
  onSelect: () => void
}

const MAX_TILT = 5

export function ServiceCard({ summary, selected, onSelect }: ServiceCardProps) {
  const reduce = useReducedMotion()
  const { ref, onPointerMove: trackSpecular } = useSpecular<HTMLElement>()
  const rotateX = useSpring(useMotionValue(0), SPRING_TILT)
  const rotateY = useSpring(useMotionValue(0), SPRING_TILT)

  const hasCalls = summary.totalCalls > 0
  const unhealthy = hasCalls && summary.errorRate > ERROR_RATE_THRESHOLD
  const successRate = hasCalls ? 100 - summary.errorRate : null
  const name = SERVICE_LABELS[summary.serviceId]

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    trackSpecular(event)
    if (reduce || event.pointerType === 'touch' || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const nx = (event.clientX - rect.left) / rect.width - 0.5
    const ny = (event.clientY - rect.top) / rect.height - 0.5
    rotateY.set(nx * MAX_TILT * 2)
    rotateX.set(-ny * MAX_TILT * 2)
  }

  const resetTilt = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.article
      ref={ref}
      className={`glass service-card ${unhealthy ? 'is-unhealthy' : ''} ${selected ? 'is-selected' : ''}`}
      data-service={summary.serviceId}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.14 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <header className="service-card__head">
        <h3>
          <button type="button" className="card-hit" aria-pressed={selected} onClick={onSelect}>
            {name}
            <span className="sr-only"> — {text.cardHint}</span>
          </button>
        </h3>
        {hasCalls && (
          <span className={`badge ${unhealthy ? 'badge--danger' : 'badge--ok'}`}>
            {unhealthy ? <AlertIcon /> : <CheckIcon />}
            {unhealthy ? text.unhealthy : text.healthy}
          </span>
        )}
      </header>

      <div className="service-card__body">
        <div>
          <p className="metric-value">
            <AnimatedNumber value={summary.totalCalls} />
          </p>
          <p className="metric-label">{text.totalCalls}</p>
        </div>
        <RingGauge percent={successRate} danger={unhealthy} label={text.successRate} />
      </div>

      <dl className="service-card__stats">
        <div>
          <dt>{text.avgTime}</dt>
          <dd>
            {hasCalls ? (
              <>
                <AnimatedNumber value={summary.averageDurationMs} /> {text.ms}
              </>
            ) : (
              '—'
            )}
          </dd>
        </div>
        <div>
          <dt>{text.errorsLabel}</dt>
          <dd className={summary.errorCalls > 0 ? 'text-danger' : ''}>
            <AnimatedNumber value={summary.errorCalls} />
          </dd>
        </div>
      </dl>

      {selected && <p className="service-card__tag">{text.filteringOn}</p>}
    </motion.article>
  )
}
