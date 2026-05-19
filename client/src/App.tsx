import { useCallback, useEffect, useState } from 'react'
import { apiGet } from './api/client'
import { fetchHandoffs, resolveHandoff } from './api/handoffs'
import { clearSession, getStoredUser, getToken } from './auth/storage'
import type { StoredUser } from './auth/storage'
import { CreateHandoffForm } from './components/CreateHandoffForm'
import { LoginPage } from './components/LoginPage'
import type { HandoffEntry, HandoffStatus, HealthResponse } from './types/handoff'

type StatusFilter = 'Open' | 'Resolved' | 'All'

function severityLabel(severity: HandoffEntry['severity']) {
  if (typeof severity === 'string') return severity
  return ['Low', 'Medium', 'High'][severity] ?? 'Unknown'
}

function statusLabel(status: HandoffEntry['status']) {
  if (typeof status === 'string') return status
  return status === 1 ? 'Resolved' : 'Open'
}

function formatUtc(iso: string) {
  return new Date(iso).toLocaleString()
}

function App() {
  const [user, setUser] = useState<StoredUser | null>(() =>
    getToken() ? getStoredUser() : null,
  )
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [handoffs, setHandoffs] = useState<HandoffEntry[]>([])
  const [filter, setFilter] = useState<StatusFilter>('Open')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  const loadHandoffs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const statusParam: HandoffStatus | undefined =
        filter === 'All' ? undefined : filter
      const [healthRes, handoffsRes] = await Promise.all([
        apiGet<HealthResponse>('/api/health'),
        fetchHandoffs(statusParam),
      ])
      setHealth(healthRes)
      setHandoffs(handoffsRes)
    } catch (e) {
      if (e instanceof Error && e.message === 'Unauthorized') {
        clearSession()
        setUser(null)
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load data')
      }
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (user) void loadHandoffs()
  }, [user, loadHandoffs])

  async function handleResolve(id: string) {
    setResolvingId(id)
    setError(null)
    try {
      await resolveHandoff(id)
      await loadHandoffs()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to resolve handoff')
    } finally {
      setResolvingId(null)
    }
  }

  function handleLogout() {
    clearSession()
    setUser(null)
    setHandoffs([])
    setHealth(null)
  }

  if (!user) {
    return <LoginPage onAuthenticated={setUser} />
  }

  const listTitle =
    filter === 'All' ? 'All handoffs' : filter === 'Open' ? 'Open handoffs' : 'Resolved handoffs'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Turnover Log</h1>
            <p className="text-sm text-slate-400">
              Signed in as {user.displayName} · supervisor notified on open/close
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {loading && <p className="text-slate-400">Loading…</p>}
        {error && (
          <p className="mb-4 rounded border border-red-800 bg-red-950/50 px-4 py-3 text-red-200">
            {error}
          </p>
        )}

        {health && (
          <p className="mb-6 text-sm text-emerald-400">
            API: {health.status} ({health.service})
          </p>
        )}

        <CreateHandoffForm onCreated={() => void loadHandoffs()} />

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {(['Open', 'Resolved', 'All'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                filter === value
                  ? 'bg-cyan-800 text-white'
                  : 'border border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <h2 className="mb-4 text-lg font-medium">{listTitle}</h2>
        {handoffs.length === 0 && !loading && !error && (
          <p className="text-slate-500">No items in this view.</p>
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
                Opened by {h.createdBy} · {formatUtc(h.createdAtUtc)}
              </p>
              {h.resolvedAtUtc && (
                <p className="mt-1 text-xs text-slate-500">
                  Closed by {h.resolvedBy ?? '—'} · {formatUtc(h.resolvedAtUtc)}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between gap-4">
                <p className="text-xs text-slate-600">{statusLabel(h.status)}</p>
                {statusLabel(h.status) === 'Open' && (
                  <button
                    type="button"
                    disabled={resolvingId === h.id}
                    onClick={() => void handleResolve(h.id)}
                    className="rounded border border-emerald-800 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-950 disabled:opacity-50"
                  >
                    {resolvingId === h.id ? 'Closing…' : 'Close (notify supervisor)'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

export default App
