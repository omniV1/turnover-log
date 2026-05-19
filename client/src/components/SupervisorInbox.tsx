import { useCallback, useEffect, useState } from 'react'
import { Bell, RefreshCw } from 'lucide-react'
import { fetchSupervisorInbox } from '@/api/notifications'
import { getErrorMessage } from '@/lib/errors'
import { formatUtc } from '@/lib/handoffDisplay'
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
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            Supervisor inbox
          </CardTitle>
          <CardDescription>
            Team open/close alerts — no SMTP required. Sign in with your supervisor email.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No notifications yet. Technicians must list your email as their supervisor when
            they register.
          </p>
        )}
        {items.map((n) => (
          <div
            key={n.id}
            className="rounded-lg border border-border/80 bg-muted/30 px-3 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-sm font-medium text-primary">
                {n.equipmentTag}
              </span>
              <Badge variant={n.eventType === 'Opened' ? 'default' : 'secondary'}>
                {n.eventType}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-foreground">{n.summary}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatUtc(n.createdAtUtc)}
              {n.emailSent ? ' · emailed' : ' · in-app only'}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
