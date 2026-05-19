import { useEffect, useState } from 'react'
import { apiGet } from './api/client'
import type { HandoffEntry, HealthResponse } from './types/handoff'

function severityLabel(severity: HandoffEntry['severity']) {
  if (typeof severity === 'string') return severity
  return ['Low', 'Medium', 'High'][severity] ?? 'Unknown'
}

function statusLabel(status: HandoffEntry['status']) {
  if (typeof status === 'string') return status
  return status === 1 ? 'Resolved' : 'Open'
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [handoffs, setHandoffs] = useState<HandoffEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [healthRes, handoffsRes] = await Promise.all([
          apiGet<HealthResponse>('/api/health'),
          apiGet<HandoffEntry[]>('/api/handoffs?status=Open'),
        ])
        setHealth(healthRes)
        setHandoffs(handoffsRes)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Turnover Log</h1>
        <p className="text-sm text-slate-400">
          Maintenance shift handoff board
        </p>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {loading && <p className="text-slate-400">Loading…</p>}
        {error && (
          <p className="rounded border border-red-800 bg-red-950/50 px-4 py-3 text-red-200">
            {error}. Start the API:{' '}
            <code className="text-sm">dotnet run --project server/TurnoverLog.Api</code>
          </p>
        )}

        {health && (
          <p className="mb-6 text-sm text-emerald-400">
            API: {health.status} ({health.service})
          </p>
        )}

        <h2 className="mb-4 text-lg font-medium">Open handoffs</h2>
        {handoffs.length === 0 && !loading && !error && (
          <p className="text-slate-500">No open items.</p>
        )}
        <ul className="space-y-3">
          {handoffs.map((h) => (
            <li
              key={h.id}
              className="rounded-lg border border-slate-800 bg-slate-900 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-sm text-cyan-400">
                  {h.equipmentTag}
                </span>
                <span className="rounded bg-amber-900/50 px-2 py-0.5 text-xs text-amber-200">
                  {severityLabel(h.severity)}
                </span>
              </div>
              <p className="mt-2 text-slate-300">{h.summary}</p>
              <p className="mt-2 text-xs text-slate-500">
                {h.createdBy} · {statusLabel(h.status)}
              </p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

export default App
