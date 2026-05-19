import { useCallback, useEffect, useState } from 'react'
import { apiGet } from '@/api/client'
import { fetchHandoffs, resolveHandoff } from '@/api/handoffs'
import { clearSession, getStoredUser, getToken } from '@/auth/storage'
import type { StoredUser } from '@/auth/storage'
import { CreateHandoffForm } from '@/components/CreateHandoffForm'
import { HandoffCard } from '@/components/HandoffCard'
import { LoginPage } from '@/components/LoginPage'
import { AppShell } from '@/components/layout/AppShell'
import { StatusFilterBar } from '@/components/StatusFilterBar'
import { SupervisorInbox } from '@/components/SupervisorInbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  const [filter, setFilter] = useState<StatusFilter>('Open')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [inboxRefreshKey, setInboxRefreshKey] = useState(0)

  function refreshInbox() {
    setInboxRefreshKey((k) => k + 1)
  }

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
      refreshInbox()
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
    <AppShell
      displayName={user.displayName}
      subtitle={`${user.displayName} · shift handoff board`}
      onLogout={handleLogout}
    >
      {health?.status === 'healthy' && (
        <div className="mb-6 flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            API online
          </Badge>
          <span className="text-xs text-muted-foreground">{health.service}</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <SupervisorInbox refreshKey={inboxRefreshKey} />

      <CreateHandoffForm
        onCreated={() => {
          void loadHandoffs()
          refreshInbox()
        }}
      />

      <StatusFilterBar value={filter} onChange={setFilter} />

      <h2 className="mb-4 text-lg font-semibold tracking-tight">
        {handoffListTitle(filter)}
      </h2>

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {!loading && handoffs.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">No items in this view.</p>
      )}

      <div className="space-y-3">
        {handoffs.map((h) => (
          <HandoffCard
            key={h.id}
            handoff={h}
            resolving={resolvingId === h.id}
            onResolve={(id) => void handleResolve(id)}
          />
        ))}
      </div>
    </AppShell>
  )
}

export default App
