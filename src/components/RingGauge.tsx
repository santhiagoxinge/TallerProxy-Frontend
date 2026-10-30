import { motion } from 'motion/react'
import { EASE_OUT } from '../motion'
import { AnimatedNumber } from './AnimatedNumber'

interface RingGaugeProps {
  /** 0-100, or null when there is nothing to measure yet. */
  percent: number | null
  danger: boolean
  label: string
}

const RADIUS = 34

export function RingGauge({ percent, danger, label }: RingGaugeProps) {
  return (
    <div className={`ring ${danger ? 'ring--danger' : ''}`} role="img" aria-label={`${label}: ${percent === null ? '—' : `${percent.toFixed(1)}%`}`}>
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle className="ring__track" cx="40" cy="40" r={RADIUS} />
        <motion.circle
          className="ring__value"
          cx="40"
          cy="40"
          r={RADIUS}
          pathLength={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: (percent ?? 0) / 100 }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        />
      </svg>
      <span className="ring__text">
        {percent === null ? '—' : <AnimatedNumber value={percent} decimals={0} suffix="%" />}
      </span>
    </div>
  )
}
