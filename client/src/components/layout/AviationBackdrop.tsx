import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AviationBackdropProps {
  children: ReactNode
  className?: string
}

/** Subtle cockpit grid + ambient glow behind page content. */
export function AviationBackdrop({ children, className }: AviationBackdropProps) {
  return (
    <div className={cn('relative min-h-svh overflow-hidden', className)}>
      <div className="aviation-bg pointer-events-none absolute inset-0" aria-hidden />
      <div className="aviation-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-primary/20 blur-3xl animate-pulse-glow"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-sky-500/10 blur-3xl animate-pulse-glow [animation-delay:2s]"
        aria-hidden
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  )
}
