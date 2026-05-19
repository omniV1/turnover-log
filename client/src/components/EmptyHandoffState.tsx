import { PlaneTakeoff } from 'lucide-react'
import type { StatusFilter } from '@/lib/handoffDisplay'

interface EmptyHandoffStateProps {
  filter: StatusFilter
}

const copy: Record<StatusFilter, { title: string; body: string }> = {
  Open: {
    title: 'Clear for departure',
    body: 'No open handoffs on the board. Log equipment findings when your shift starts or issues arise.',
  },
  Resolved: {
    title: 'All closed out',
    body: 'No resolved items in this view yet. Closed handoffs appear here for shift turnover records.',
  },
  All: {
    title: 'Log is empty',
    body: 'Create your first handoff to start the maintenance turnover trail for this shift.',
  },
}

export function EmptyHandoffState({ filter }: EmptyHandoffStateProps) {
  const { title, body } = copy[filter]

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 px-6 py-14 text-center animate-fade-up">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
        <PlaneTakeoff className="size-8" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
    </div>
  )
}
