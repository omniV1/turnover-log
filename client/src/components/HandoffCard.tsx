import { CheckCircle2, Clock, Plane } from 'lucide-react'
import { formatUtc, isHandoffOpen } from '@/lib/handoffDisplay'
import {
  severityAccentClass,
  severityBadgeVariant,
  severityGlowClass,
} from '@/lib/severity'
import { cn } from '@/lib/utils'
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
  animationIndex?: number
}

export function HandoffCard({
  handoff,
  resolving,
  onResolve,
  animationIndex = 0,
}: HandoffCardProps) {
  const open = isHandoffOpen(handoff)

  return (
    <Card
      className={cn(
        'overflow-hidden glass-panel transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
        severityAccentClass(handoff.severity),
        severityGlowClass(handoff.severity),
        'animate-fade-up opacity-0',
      )}
      style={{
        animationDelay: `${animationIndex * 60}ms`,
        animationFillMode: 'forwards',
      }}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div className="flex gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Plane className="size-4" aria-hidden />
          </div>
          <div className="space-y-1">
            <CardTitle className="font-mono text-base tracking-wide">
              {handoff.equipmentTag}
            </CardTitle>
            <CardDescription className="line-clamp-3 text-sm leading-relaxed">
              {handoff.summary}
            </CardDescription>
          </div>
        </div>
        <Badge variant={severityBadgeVariant(handoff.severity)} className="shrink-0">
          {handoff.severity}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 border-t border-border/40 pt-3 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <Clock className="size-3.5 shrink-0 text-primary/80" />
          Opened by {handoff.createdBy} · {formatUtc(handoff.createdAtUtc)}
        </p>
        {handoff.resolvedAtUtc && (
          <p className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
            Closed by {handoff.resolvedBy ?? '—'} · {formatUtc(handoff.resolvedAtUtc)}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-4 border-t border-border/40 bg-muted/20">
        <Badge variant={open ? 'default' : 'secondary'} className="uppercase tracking-wide">
          {handoff.status}
        </Badge>
        {open && (
          <Button
            size="sm"
            disabled={resolving}
            onClick={() => onResolve(handoff.id)}
            className="bg-primary/90 hover:bg-primary"
          >
            {resolving ? 'Closing…' : 'Close handoff'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
