import { useCallback, useEffect, useState } from 'react'
import { Bell, ChevronDown, RefreshCw } from 'lucide-react'
import { fetchSupervisorInbox } from '@/api/notifications'
import { getErrorMessage } from '@/lib/errors'
import { formatUtc } from '@/lib/handoffDisplay'
import { cn } from '@/lib/utils'
import type { SupervisorNotification } from '@/types/notification'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface SupervisorInboxProps {
  refreshKey: number
}

export function SupervisorInbox({ refreshKey }: SupervisorInboxProps) {
  const [expanded, setExpanded] = useState(true)
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

  const unreadCount = items.filter((n) => n.eventType === 'Opened').length

  return (
    <Card className="glass-panel">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={() => setExpanded((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setExpanded((v) => !v)
            }
          }}
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
        >
          <CardTitle className="flex flex-wrap items-center gap-2">
            <Bell className="size-4 text-amber-400" />
            Supervisor channel
            {unreadCount > 0 && (
              <Badge variant="destructive" className="font-mono text-xs">
                {unreadCount} open
              </Badge>
            )}
            <ChevronDown
              className={cn(
                'size-4 text-muted-foreground transition-transform',
                expanded && 'rotate-180',
              )}
            />
          </CardTitle>
          <CardDescription>
            Line-lead alerts when technicians open or close handoffs on your watch.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} className="shrink-0">
          <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-3 border-t border-border/40 pt-4">
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!loading && !error && items.length === 0 && (
            <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              No supervisor traffic yet. Technicians must register with your email as their
              supervisor contact.
            </p>
          )}
          {items.map((n, i) => (
            <div
              key={n.id}
              className={cn(
                'rounded-lg border px-4 py-3 transition-colors animate-fade-up opacity-0',
                n.eventType === 'Opened'
                  ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
                  : 'border-border/60 bg-muted/20 hover:border-border',
              )}
              style={{
                animationDelay: `${i * 50}ms`,
                animationFillMode: 'forwards',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-sm font-semibold text-primary">
                  {n.equipmentTag}
                </span>
                <Badge variant={n.eventType === 'Opened' ? 'default' : 'secondary'}>
                  {n.eventType}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{n.summary}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatUtc(n.createdAtUtc)}
                {n.emailSent ? ' · emailed' : ' · in-app only'}
              </p>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  )
}
