import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { login, register } from '@/api/auth'
import { setSession } from '@/auth/storage'
import type { StoredUser } from '@/auth/storage'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAsyncAction } from '@/hooks/useAsyncAction'

interface LoginPageProps {
  onAuthenticated: (user: StoredUser) => void
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('demo@turnover.local')
  const [password, setPassword] = useState('Demo1234!')
  const [displayName, setDisplayName] = useState('')
  const [supervisorEmail, setSupervisorEmail] = useState('supervisor@turnover.local')
  const { error, loading, run } = useAsyncAction()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const response = await run(async () => {
      if (mode === 'login') {
        return login({ email, password })
      }
      return register({
        email,
        password,
        supervisorEmail,
        displayName: displayName.trim() || undefined,
      })
    }, 'Authentication failed')

    if (!response) return

    const user: StoredUser = {
      email: response.email,
      displayName: response.displayName,
    }
    setSession(response.token, user)
    onAuthenticated(user)
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ClipboardList className="size-6" aria-hidden />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Turnover Log</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Maintenance shift handoffs — sign in to view and record handoff entries.
        </p>
      </div>

      <Card className="w-full max-w-md border-border/60 shadow-lg">
        <CardHeader>
          <CardTitle>{mode === 'login' ? 'Sign in' : 'Create account'}</CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Use your technician credentials.'
              : 'Register as a technician; supervisor email receives alerts.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={(e) => void handleSubmit(e)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Alex Technician"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="supervisorEmail">Supervisor email</Label>
                <Input
                  id="supervisorEmail"
                  type="email"
                  value={supervisorEmail}
                  onChange={(e) => setSupervisorEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Register'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login'
                ? 'Need an account? Register'
                : 'Already have an account? Sign in'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Demo: demo@turnover.local / Demo1234!
      </p>
    </div>
  )
}