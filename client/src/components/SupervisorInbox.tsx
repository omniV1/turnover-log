import { useCallback, useEffect, useState } from 'react'
import { fetchSupervisorInbox } from '../api/notifications'
import { getErrorMessage } from '../lib/errors'
import { formatUtc } from '../lib/handoffDisplay'
import type { SupervisorNotification } from '../types/notification'

interface SupervisorInboxProps {
  refreshKey: number
}

export function SupervisorInbox({ refreshKey }: SupervisorInboxProps) {
  const [items, setItems] = useState<SupervisorNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await fetchSupervisorInbox())
    } catch (e) {
      setError(getErrorMessage(e, 'Failed to load supervisor inbox'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  return (
    <section className="mb-8 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">Supervisor inbox</h2>
          <p className="text-xs text-slate-500">
            No SMTP required — sign in with your supervisor email to see team alerts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading inbox…</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-slate-500">
          No notifications yet. Technicians must list your email as their supervisor when
          they register.
        </p>
      )}
      <ul className="space-y-2">
        {items.map((n) => (
          <li
            key={n.id}
            className="rounded border border-slate-800 bg-slate-950/60 px-3 py-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-sm text-cyan-400">{n.equipmentTag}</span>
              <span
                className={`rounded px-2 py-0.5 text-xs ${
                  n.eventType === 'Opened'
                    ? 'bg-amber-900/50 text-amber-200'
                    : 'bg-emerald-900/50 text-emerald-200'
                }`}
              >
                {n.eventType}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-300">{n.summary}</p>
            <p className="mt-1 text-xs text-slate-500">
              {formatUtc(n.createdAtUtc)}
              {n.emailSent ? ' · emailed' : ' · in-app only'}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
