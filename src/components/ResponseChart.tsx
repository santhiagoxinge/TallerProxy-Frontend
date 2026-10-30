import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { SERVICE_LABELS, STATUS_LABELS, text } from '../labels'
import type { RecentByService } from '../hooks/useDashboardData'
import { RECENT_CALLS } from '../hooks/useDashboardData'
import type { CallStatus, ServiceId } from '../types'
import { SERVICE_IDS } from '../types'

export const SERVICE_COLORS: Record<ServiceId, string> = {
  inventory: '#38d6e6',
  orders: '#ffb54d',
  payments: '#a99bff',
}

const DANGER = '#ff5c70'

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
          <p key={id} style={{ color: item.color }}>
            {SERVICE_LABELS[id]}: {item.value} {text.ms}
            {status === 'ERROR' && ` · ${STATUS_LABELS.ERROR}`}
          </p>
        )
      })}
    </div>
  )
}

export function ResponseChart({ recent }: { recent: RecentByService | null }) {
  const hasData = recent !== null && SERVICE_IDS.some((id) => recent[id].length > 0)

  return (
    <section className="glass panel" aria-labelledby="chart-title">
      <header className="panel__head">
        <div>
          <h2 id="chart-title">{text.chartTitle}</h2>
          <p className="panel__sub">{text.chartSubtitle}</p>
        </div>
      </header>

      {!hasData ? (
        <p className="empty empty--chart">{text.chartEmpty}</p>
      ) : (
        <div className="chart" role="img" aria-label={`${text.chartTitle}. ${text.chartSubtitle}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={buildRows(recent)} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="call"
                stroke="rgba(226,234,255,0.5)"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="rgba(226,234,255,0.5)"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                unit={` ${text.ms}`}
                width={64}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.25)' }} />
              <Legend
                formatter={(value: string) => SERVICE_LABELS[value as ServiceId]}
                wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
              />
              {SERVICE_IDS.map((id) => (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  stroke={SERVICE_COLORS[id]}
                  strokeWidth={2.5}
                  dot={dots[id]}
                  activeDot={{ r: 6 }}
                  connectNulls
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
