import { PlaneTakeoff } from 'lucide-react'
import { copy } from '@/lib/copy'
import type { StatusFilter } from '@/lib/handoffDisplay'

interface EmptyHandoffStateProps {
  filter: StatusFilter
}

export function EmptyHandoffState({ filter }: EmptyHandoffStateProps) {
  const { title, body } = copy.empty[filter]

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
