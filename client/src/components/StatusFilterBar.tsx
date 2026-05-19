import { Filter, ListChecks, ListTodo } from 'lucide-react'
import {
  STATUS_FILTER_OPTIONS,
  type StatusFilter,
} from '@/lib/handoffDisplay'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const filterIcons: Record<StatusFilter, typeof ListTodo> = {
  Open: ListTodo,
  Resolved: ListChecks,
  All: Filter,
}

interface StatusFilterBarProps {
  value: StatusFilter
  onChange: (value: StatusFilter) => void
  counts?: Partial<Record<StatusFilter, number>>
}

export function StatusFilterBar({ value, onChange, counts }: StatusFilterBarProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as StatusFilter)}
      className="mb-6"
    >
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-muted/40 p-1 sm:w-auto">
        {STATUS_FILTER_OPTIONS.map((option) => {
          const Icon = filterIcons[option]
          const count = counts?.[option]
          return (
            <TabsTrigger
              key={option}
              value={option}
              className="gap-2 px-4 py-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
            >
              <Icon className="size-4 shrink-0" />
              {option}
              {count !== undefined && (
                <span className="rounded-full bg-background/80 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
                  {count}
                </span>
              )}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
