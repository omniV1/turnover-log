import { useCallback, useEffect, useState } from 'react'
import { apiGet } from './api/client'
import { fetchHandoffs, resolveHandoff } from './api/handoffs'
import { clearSession, getStoredUser, getToken } from './auth/storage'
import type { StoredUser } from './auth/storage'
import { CreateHandoffForm } from './components/CreateHandoffForm'
import { HandoffCard } from './components/HandoffCard'
import { LoginPage } from './components/LoginPage'
import { StatusFilterBar } from './components/StatusFilterBar'
import { getErrorMessage } from './lib/errors'
import {
  handoffListTitle,
  toApiStatusFilter,
  type StatusFilter,
} from './lib/handoffDisplay'
import type { HandoffEntry, HealthResponse } from './types/handoff'

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
      const [healthRes, handoffsRes] = await Promise.all([
        apiGet<HealthResponse>('/api/health'),
        fetchHandoffs(toApiStatusFilter(filter)),
      ])
      setHealth(healthRes)
      setHandoffs(handoffsRes)
    } catch (e) {
      if (e instanceof Error && e.message === 'Unauthorized') {
        clearSession()
        setUser(null)
      } else {
        setError(getErrorMessage(e, 'Failed to load data'))
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
      setError(getErrorMessage(e, 'Failed to resolve handoff'))
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

        <StatusFilterBar value={filter} onChange={setFilter} />

        <h2 className="mb-4 text-lg font-medium">{handoffListTitle(filter)}</h2>
        {handoffs.length === 0 && !loading && !error && (
          <p className="text-slate-500">No items in this view.</p>
        )}
        <ul className="space-y-3">
          {handoffs.map((h) => (
            <HandoffCard
              key={h.id}
              handoff={h}
              resolving={resolvingId === h.id}
              onResolve={(id) => void handleResolve(id)}
            />
          ))}
        </ul>
      </main>
    </div>
  )
}

export default App
