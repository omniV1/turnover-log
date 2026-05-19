import { Plane } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
  className?: string
}

const sizeMap = {
  sm: { box: 'size-9', icon: 'size-4', title: 'text-base', tag: 'text-xs' },
  md: { box: 'size-11', icon: 'size-5', title: 'text-lg', tag: 'text-xs' },
  lg: { box: 'size-14', icon: 'size-7', title: 'text-2xl', tag: 'text-sm' },
} as const

export function BrandMark({ size = 'md', showTagline = false, className }: BrandMarkProps) {
  const s = sizeMap[size]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-gradient-to-br from-primary/25 to-primary/5 text-primary shadow-[0_0_24px_-4px] shadow-primary/30',
          s.box,
        )}
      >
        <Plane className={cn(s.icon, 'rotate-[-12deg]')} aria-hidden />
      </div>
      <div>
        <p className={cn('font-semibold tracking-tight', s.title)}>
          Turnover<span className="text-primary">Log</span>
        </p>
        {showTagline && (
          <p className={cn('text-muted-foreground', s.tag)}>
            Aviation maintenance shift handoff
          </p>
        )}
      </div>
    </div>
  )
}
