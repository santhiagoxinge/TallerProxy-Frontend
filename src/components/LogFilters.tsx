import { SERVICE_LABELS, STATUS_LABELS, text } from '../labels'
import type { CallStatus, LogFilters as Filters, ServiceId } from '../types'
import { SERVICE_IDS } from '../types'
import { CloseIcon } from './Icons'

interface LogFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export const EMPTY_FILTERS: Filters = { service: '', status: '', from: '', to: '' }

export function LogFilters({ filters, onChange }: LogFiltersProps) {
  const isActive = Object.values(filters).some(Boolean)

  return (
    <form className="filters" onSubmit={(event) => event.preventDefault()}>
      <label>
        <span>{text.filterService}</span>
        <select
          value={filters.service}
          onChange={(e) => onChange({ ...filters, service: e.target.value as ServiceId | '' })}
        >
          <option value="">{text.filterAll}</option>
          {SERVICE_IDS.map((id) => (
            <option key={id} value={id}>
              {SERVICE_LABELS[id]}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>{text.filterStatus}</span>
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value as CallStatus | '' })}
        >
          <option value="">{text.filterAll}</option>
          {(Object.keys(STATUS_LABELS) as CallStatus[]).map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>{text.filterFrom}</span>
        <input
          type="datetime-local"
          value={filters.from}
          max={filters.to || undefined}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
        />
      </label>

      <label>
        <span>{text.filterTo}</span>
        <input
          type="datetime-local"
          value={filters.to}
          min={filters.from || undefined}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
        />
      </label>

      <button type="button" className="btn btn--ghost" disabled={!isActive} onClick={() => onChange(EMPTY_FILTERS)}>
        <CloseIcon />
        {text.clearFilters}
      </button>
    </form>
  )
}
