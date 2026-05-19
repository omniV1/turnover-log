import { ClipboardList, LogOut } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface AppShellProps {
  displayName: string
  subtitle?: string
  onLogout: () => void
  children: ReactNode
}

export function AppShell({
  displayName,
  subtitle,
  onLogout,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <ClipboardList className="size-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Turnover Log</h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {subtitle ?? `Signed in as ${displayName}`}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}
