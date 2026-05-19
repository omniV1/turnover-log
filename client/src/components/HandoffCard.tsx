import { formatUtc, isHandoffOpen } from '../lib/handoffDisplay'
import type { HandoffEntry } from '../types/handoff'

interface HandoffCardProps {
  handoff: HandoffEntry
  resolving: boolean
  onResolve: (id: string) => void
}

export function HandoffCard({ handoff, resolving, onResolve }: HandoffCardProps) {
  const open = isHandoffOpen(handoff)

  return (
    <li className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-sm text-cyan-400">{handoff.equipmentTag}</span>
        <span className="rounded bg-amber-900/50 px-2 py-0.5 text-xs text-amber-200">
          {handoff.severity}
        </span>
      </div>
      <p className="mt-2 text-slate-300">{handoff.summary}</p>
      <p className="mt-2 text-xs text-slate-500">
        Opened by {handoff.createdBy} · {formatUtc(handoff.createdAtUtc)}
      </p>
      {handoff.resolvedAtUtc && (
        <p className="mt-1 text-xs text-slate-500">
          Closed by {handoff.resolvedBy ?? '—'} · {formatUtc(handoff.resolvedAtUtc)}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-600">{handoff.status}</p>
        {open && (
          <button
            type="button"
            disabled={resolving}
            onClick={() => onResolve(handoff.id)}
            className="rounded border border-emerald-800 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-950 disabled:opacity-50"
          >
            {resolving ? 'Closing…' : 'Close (notify supervisor)'}
          </button>
        )}
      </div>
    </li>
  )
}
