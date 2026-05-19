import {
  STATUS_FILTER_OPTIONS,
  type StatusFilter,
} from '../lib/handoffDisplay'

interface StatusFilterBarProps {
  value: StatusFilter
  onChange: (value: StatusFilter) => void
}

export function StatusFilterBar({ value, onChange }: StatusFilterBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {STATUS_FILTER_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            value === option
              ? 'bg-cyan-800 text-white'
              : 'border border-slate-700 text-slate-400 hover:bg-slate-800'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
