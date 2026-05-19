import {
  STATUS_FILTER_OPTIONS,
  type StatusFilter,
} from '@/lib/handoffDisplay'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface StatusFilterBarProps {
  value: StatusFilter
  onChange: (value: StatusFilter) => void
}

export function StatusFilterBar({ value, onChange }: StatusFilterBarProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as StatusFilter)}
      className="mb-6"
    >
      <TabsList>
        {STATUS_FILTER_OPTIONS.map((option) => (
          <TabsTrigger key={option} value={option}>
            {option}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
