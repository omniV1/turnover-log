import { AlertTriangle, ClipboardCheck, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ShiftStats } from './shiftStats'

interface ShiftStatsBarProps {
  stats: ShiftStats
  apiOnline?: boolean
  serviceName?: string
}

const statCards = [
  {
    key: 'open' as const,
    label: 'Open items',
    icon: Radio,
    gradient: 'from-sky-500/20',
    iconClass: 'text-sky-300',
    ring: 'ring-sky-500/30',
  },
  {
    key: 'highPriority' as const,
    label: 'High priority',
    icon: AlertTriangle,
    gradient: 'from-amber-500/25',
    iconClass: 'text-amber-300',
    ring: 'ring-amber-500/40',
  },
  {
    key: 'resolved' as const,
    label: 'Resolved',
    icon: ClipboardCheck,
    gradient: 'from-emerald-500/20',
    iconClass: 'text-emerald-300',
    ring: 'ring-emerald-500/30',
  },
] as const

export function ShiftStatsBar({ stats, apiOnline, serviceName }: ShiftStatsBarProps) {
  return (
    <section className="mb-8 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-primary/90">
            Operations board
          </p>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Shift overview</h2>
        </div>
        {apiOnline && (
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-200">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            Systems online
            {serviceName && <span className="text-emerald-200/70">· {serviceName}</span>}
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={card.key}
              className={cn(
                'group relative overflow-hidden rounded-xl border border-border/60 bg-card/80 p-4 backdrop-blur-sm',
                'transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
                'animate-fade-up opacity-0',
              )}
              style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
            >
              <div
                className={cn(
                  'pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-70',
                  card.gradient,
                )}
              />
              <div className="relative flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="mt-1 font-mono text-3xl font-semibold tabular-nums">
                    {stats[card.key]}
                  </p>
                </div>
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-lg bg-background/50 ring-1',
                    card.ring,
                  )}
                >
                  <Icon className={cn('size-5', card.iconClass)} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
