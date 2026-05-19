import { LogOut } from 'lucide-react'
import type { ReactNode } from 'react'
import { AviationBackdrop } from '@/components/layout/AviationBackdrop'
import { BrandMark } from '@/components/layout/BrandMark'
import { Button } from '@/components/ui/button'
import { copy } from '@/lib/copy'

interface AppShellProps {
  displayName: string
  subtitle?: string
  onLogout: () => void
  children: ReactNode
}

function LiveClock() {
  const now = new Date()
  const utc = now.toISOString().slice(11, 16)
  const local = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="hidden text-right sm:block" aria-live="polite">
      <p className="font-tag text-sm font-semibold text-foreground">{local}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {copy.shell.localTime} · {utc} {copy.shell.zuluSuffix}
      </p>
    </div>
  )
}

export function AppShell({
  displayName,
  subtitle,
  onLogout,
  children,
}: AppShellProps) {
  return (
    <AviationBackdrop>
      <header className="sticky top-0 z-20 border-b border-border/50 glass-panel">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
          <BrandMark size="md" showTagline />
          <div className="flex items-center gap-3 sm:gap-6">
            <LiveClock />
            <div className="hidden h-8 w-px bg-border/80 md:block" />
            <div className="hidden min-w-0 md:block">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {subtitle ?? copy.shell.defaultRole}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="shrink-0"
              aria-label={copy.shell.signOut}
            >
              <LogOut className="size-4" aria-hidden />
              <span className="hidden sm:inline">{copy.shell.signOut}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </AviationBackdrop>
  )
}
