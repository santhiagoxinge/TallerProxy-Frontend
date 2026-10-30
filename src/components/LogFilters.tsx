import { SERVICE_LABELS, STATUS_LABELS, text } from '../labels'
import type { CallStatus, LogFilters as Filters, ServiceId } from '../types'
import { SERVICE_IDS } from '../types'
import { CloseIcon } from './Icons'
import { SegmentedControl } from './SegmentedControl'

interface LogFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export const EMPTY_FILTERS: Filters = { service: '', status: '', from: '', to: '' }

const serviceOptions = [
  { value: '' as const, label: text.filterAll },
  ...SERVICE_IDS.map((id) => ({ value: id, label: SERVICE_LABELS[id] })),
]

const statusOptions = [
  { value: '' as const, label: text.filterAll },
  ...(Object.keys(STATUS_LABELS) as CallStatus[]).map((status) => ({ value: status, label: STATUS_LABELS[status] })),
]

export function LogFilters({ filters, onChange }: LogFiltersProps) {
  const isActive = Object.values(filters).some(Boolean)

  return (
    <form className="filters" onSubmit={(event) => event.preventDefault()}>
      <SegmentedControl<ServiceId | ''>
        label={text.filterService}
        value={filters.service}
        options={serviceOptions}
        onChange={(service) => onChange({ ...filters, service })}
      />

      <SegmentedControl<CallStatus | ''>
        label={text.filterStatus}
        value={filters.status}
        options={statusOptions}
        onChange={(status) => onChange({ ...filters, status })}
      />

      <label className="field">
        <span>{text.filterFrom}</span>
        <input
          type="datetime-local"
          value={filters.from}
          max={filters.to || undefined}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
        />
      </label>

      <label className="field">
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
