import { CheckCircle2, Clock } from 'lucide-react'
import { formatUtc, isHandoffOpen } from '@/lib/handoffDisplay'
import { severityBadgeVariant } from '@/lib/severity'
import type { HandoffEntry } from '@/types/handoff'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface HandoffCardProps {
  handoff: HandoffEntry
  resolving: boolean
  onResolve: (id: string) => void
}

export function HandoffCard({ handoff, resolving, onResolve }: HandoffCardProps) {
  const open = isHandoffOpen(handoff)

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="font-mono text-base">{handoff.equipmentTag}</CardTitle>
          <CardDescription className="line-clamp-3">{handoff.summary}</CardDescription>
        </div>
        <Badge variant={severityBadgeVariant(handoff.severity)}>{handoff.severity}</Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Clock className="size-3.5 shrink-0" />
          Opened by {handoff.createdBy} · {formatUtc(handoff.createdAtUtc)}
        </p>
        {handoff.resolvedAtUtc && (
          <p className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
            Closed by {handoff.resolvedBy ?? '—'} · {formatUtc(handoff.resolvedAtUtc)}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-4">
        <Badge variant={open ? 'outline' : 'secondary'}>{handoff.status}</Badge>
        {open && (
          <Button
            size="sm"
            variant="secondary"
            disabled={resolving}
            onClick={() => onResolve(handoff.id)}
          >
            {resolving ? 'Closing…' : 'Close handoff'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
