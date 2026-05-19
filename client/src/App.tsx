import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiGet } from '@/api/client'
import { fetchHandoffs, resolveHandoff } from '@/api/handoffs'
import { clearSession, getStoredUser, getToken } from '@/auth/storage'
import type { StoredUser } from '@/auth/storage'
import { CreateHandoffForm } from '@/components/CreateHandoffForm'
import { EmptyHandoffState } from '@/components/EmptyHandoffState'
import { HandoffCard } from '@/components/HandoffCard'
import { LoginPage } from '@/components/LoginPage'
import { AppShell } from '@/components/layout/AppShell'
import { ShiftStatsBar } from '@/components/dashboard/ShiftStatsBar'
import { computeShiftStats } from '@/components/dashboard/shiftStats'
import { StatusFilterBar } from '@/components/StatusFilterBar'
import { SupervisorInbox } from '@/components/SupervisorInbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { copy } from '@/lib/copy'
import { getErrorMessage } from '@/lib/errors'
import {
  handoffListTitle,
  toApiStatusFilter,
  type StatusFilter,
} from '@/lib/handoffDisplay'
import type { HandoffEntry, HealthResponse } from '@/types/handoff'

function App() {
  const [user, setUser] = useState<StoredUser | null>(() =>
    getToken() ? getStoredUser() : null,
  )
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [handoffs, setHandoffs] = useState<HandoffEntry[]>([])
  const [allHandoffs, setAllHandoffs] = useState<HandoffEntry[]>([])
  const [filter, setFilter] = useState<StatusFilter>('Open')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [inboxRefreshKey, setInboxRefreshKey] = useState(0)

  function refreshInbox() {
    setInboxRefreshKey((k) => k + 1)
  }

  const loadAllForStats = useCallback(async () => {
    try {
      setAllHandoffs(await fetchHandoffs(undefined))
    } catch {
      /* stats are supplementary */
    }
  }, [])

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
        setError(getErrorMessage(e, copy.board.loadFailed))
      }
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (user) {
      void loadHandoffs()
      void loadAllForStats()
    }
  }, [user, loadHandoffs, loadAllForStats])

  async function handleResolve(id: string) {
    setResolvingId(id)
    setError(null)
    try {
      await resolveHandoff(id)
      await Promise.all([loadHandoffs(), loadAllForStats()])
      refreshInbox()
    } catch (e) {
      setError(getErrorMessage(e, copy.board.resolveFailed))
    } finally {
      setResolvingId(null)
    }
  }

  function handleLogout() {
    clearSession()
    setUser(null)
    setHandoffs([])
    setAllHandoffs([])
    setHealth(null)
  }

  const stats = useMemo(() => computeShiftStats(allHandoffs), [allHandoffs])

  const filterCounts = useMemo(
    () => ({
      Open: allHandoffs.filter((h) => h.status === 'Open').length,
      Resolved: allHandoffs.filter((h) => h.status === 'Resolved').length,
      All: allHandoffs.length,
    }),
    [allHandoffs],
  )

  if (!user) {
    return <LoginPage onAuthenticated={setUser} />
  }

  return (
    <AppShell
      displayName={user.displayName}
      subtitle={copy.shell.boardSubtitle}
      onLogout={handleLogout}
    >
      <ShiftStatsBar
        stats={stats}
        apiOnline={health?.status === 'healthy'}
        serviceName={health?.service}
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <SupervisorInbox refreshKey={inboxRefreshKey} />
        <CreateHandoffForm
          onCreated={() => {
            void loadHandoffs()
            void loadAllForStats()
            refreshInbox()
          }}
        />
      </div>

      <section>
        <StatusFilterBar value={filter} onChange={setFilter} counts={filterCounts} />

        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">{handoffListTitle(filter)}</h2>
          {!loading && handoffs.length > 0 && (
            <p className="font-tag text-xs text-muted-foreground">
              {copy.board.recordCount(handoffs.length)}
            </p>
          )}
        </div>

        {loading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-xl border border-border/40 bg-muted/30"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        )}

        {!loading && handoffs.length === 0 && !error && (
          <EmptyHandoffState filter={filter} />
        )}

        <div className="space-y-3">
          {handoffs.map((h, index) => (
            <HandoffCard
              key={h.id}
              handoff={h}
              resolving={resolvingId === h.id}
              onResolve={(id) => void handleResolve(id)}
              animationIndex={index}
            />
          ))}
        </div>
      </section>
    </AppShell>
  )
}

export default App
