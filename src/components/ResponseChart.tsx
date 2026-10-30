import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useSpecular } from '../hooks/useSpecular'
import { SERVICE_LABELS, STATUS_LABELS, text } from '../labels'
import type { RecentByService } from '../hooks/useDashboardData'
import { RECENT_CALLS } from '../hooks/useDashboardData'
import type { CallStatus, ServiceId } from '../types'
import { SERVICE_IDS } from '../types'

export const SERVICE_COLORS: Record<ServiceId, string> = {
  inventory: '#0891b2',
  orders: '#d97706',
  payments: '#6d5bd0',
}

const DANGER = '#dc2626'
const AXIS = '#36506e'

type ChartRow = { call: number } & Partial<Record<ServiceId, number>> &
  Partial<Record<`${ServiceId}Status`, CallStatus>>

/** Logs arrive newest first; the chart reads oldest to newest, aligned to the latest call. */
function buildRows(recent: RecentByService): ChartRow[] {
  const rows: ChartRow[] = Array.from({ length: RECENT_CALLS }, (_, i) => ({ call: i + 1 }))
  for (const id of SERVICE_IDS) {
    const calls = [...recent[id]].reverse()
    const offset = RECENT_CALLS - calls.length
    calls.forEach((entry, i) => {
      rows[offset + i][id] = entry.durationMs
      rows[offset + i][`${id}Status`] = entry.status
    })
  }
  return rows
}

interface DotProps {
  cx?: number
  cy?: number
  payload?: ChartRow
}

function makeDot(id: ServiceId) {
  return function CallDot({ cx, cy, payload }: DotProps) {
    if (cx === undefined || cy === undefined || payload?.[id] === undefined) return <g />
    const failed = payload[`${id}Status`] === 'ERROR'
    return (
      <circle
        cx={cx}
        cy={cy}
        r={failed ? 5 : 3}
        fill={failed ? DANGER : SERVICE_COLORS[id]}
        stroke={failed ? '#fff' : 'none'}
        strokeWidth={1.5}
      />
    )
  }
}

const dots = Object.fromEntries(SERVICE_IDS.map((id) => [id, makeDot(id)])) as Record<
  ServiceId,
  ReturnType<typeof makeDot>
>

interface TooltipPayload {
  dataKey?: string | number
  value?: number
  color?: string
  payload?: ChartRow
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: number }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip glass-solid">
      <strong>
        {text.chartX} {label}
      </strong>
      {payload.map((item) => {
        const id = item.dataKey as ServiceId
        const status = item.payload?.[`${id}Status`]
        return (
          <p key={id} style={{ color: SERVICE_COLORS[id] }}>
            {SERVICE_LABELS[id]}: {item.value} {text.ms}
            {status === 'ERROR' && ` · ${STATUS_LABELS.ERROR}`}
          </p>
        )
      })}
    </div>
  )
}

interface ResponseChartProps {
  recent: RecentByService | null
  hidden: ReadonlySet<ServiceId>
  focus: ServiceId | ''
  onToggleSeries: (id: ServiceId) => void
}

export function ResponseChart({ recent, hidden, focus, onToggleSeries }: ResponseChartProps) {
  const { ref, onPointerMove } = useSpecular<HTMLElement>()
  const [hovered, setHovered] = useState<ServiceId | null>(null)
  const [drawIn, setDrawIn] = useState(true)
  const hasData = recent !== null && SERVICE_IDS.some((id) => recent[id].length > 0)
  const emphasis = hovered ?? (focus || null)

  // Lines draw in once on first paint; later polls update in place so the chart stays calm.
  useEffect(() => {
    if (!hasData) return
    const timer = window.setTimeout(() => setDrawIn(false), 1400)
    return () => window.clearTimeout(timer)
  }, [hasData])

  return (
    <section ref={ref} onPointerMove={onPointerMove} className="glass panel" aria-labelledby="chart-title">
      <header className="panel__head">
        <div>
          <h2 id="chart-title">{text.chartTitle}</h2>
          <p className="panel__sub">{text.chartSubtitle}</p>
        </div>

        <div className="legend" role="group" aria-label={text.legendToggle}>
          {SERVICE_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className="legend__chip"
              data-service={id}
              aria-pressed={!hidden.has(id)}
              onClick={() => onToggleSeries(id)}
              onPointerEnter={() => setHovered(id)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(id)}
              onBlur={() => setHovered(null)}
            >
              <span className="legend__swatch" />
              {SERVICE_LABELS[id]}
            </button>
          ))}
        </div>
      </header>

      {!hasData ? (
        <p className="empty empty--chart">{text.chartEmpty}</p>
      ) : (
        <div className="chart" role="img" aria-label={`${text.chartTitle}. ${text.chartSubtitle}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={buildRows(recent)} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
              <CartesianGrid stroke="rgba(15, 40, 80, 0.1)" vertical={false} />
              <XAxis dataKey="call" stroke={AXIS} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis
                stroke={AXIS}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                unit={` ${text.ms}`}
                width={64}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(15, 40, 80, 0.3)' }} />
              {SERVICE_IDS.map((id) => (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  hide={hidden.has(id)}
                  stroke={SERVICE_COLORS[id]}
                  strokeOpacity={emphasis && emphasis !== id ? 0.22 : 1}
                  strokeWidth={emphasis === id ? 3.5 : 2.5}
                  dot={dots[id]}
                  activeDot={{ r: 6 }}
                  connectNulls
                  isAnimationActive={drawIn}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
