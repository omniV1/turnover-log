import { useState } from 'react'
import { Shield, Wrench } from 'lucide-react'
import { login, register } from '@/api/auth'
import { setSession } from '@/auth/storage'
import type { StoredUser } from '@/auth/storage'
import { AviationBackdrop } from '@/components/layout/AviationBackdrop'
import { BrandMark } from '@/components/layout/BrandMark'
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
import { copy } from '@/lib/copy'

interface LoginPageProps {
  onAuthenticated: (user: StoredUser) => void
}

const highlightIcons = [Wrench, Shield] as const

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [supervisorEmail, setSupervisorEmail] = useState('')
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
    }, copy.auth.authFailed)

    if (!response) return

    const user: StoredUser = {
      email: response.email,
      displayName: response.displayName,
    }
    setSession(response.token, user)
    onAuthenticated(user)
  }

  return (
    <AviationBackdrop>
      <div className="relative mx-auto flex min-h-svh max-w-6xl flex-col lg:flex-row">
        <section className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-10 lg:py-16">
          <BrandMark size="lg" showTagline className="mb-10 animate-fade-up" />
          <h1 className="max-w-lg text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl animate-fade-up [animation-delay:80ms]">
            {copy.auth.heroTitle}{' '}
            <span className="bg-gradient-to-r from-sky-300 to-primary bg-clip-text text-transparent">
              {copy.auth.heroHighlight}
            </span>
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground animate-fade-up [animation-delay:120ms]">
            {copy.auth.heroBody}
          </p>

          <ul className="mt-10 space-y-4">
            {copy.auth.highlights.map((item, i) => {
              const Icon = highlightIcons[i] ?? Wrench
              return (
                <li
                  key={item.title}
                  className="flex gap-4 rounded-xl border border-border/50 bg-card/40 p-4 backdrop-blur-sm transition-colors hover:border-primary/30 animate-fade-up opacity-0"
                  style={{
                    animationDelay: `${180 + i * 80}ms`,
                    animationFillMode: 'forwards',
                  }}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="flex flex-1 items-center justify-center px-6 py-10 lg:border-l lg:border-border/40 lg:px-10">
          <Card className="w-full max-w-md glass-panel shadow-2xl shadow-primary/5 animate-fade-up [animation-delay:200ms]">
            <CardHeader>
              <p className="text-xs font-medium uppercase tracking-widest text-primary">
                {copy.auth.accessLabel}
              </p>
              <CardTitle className="text-2xl">
                {mode === 'login' ? copy.auth.signInTitle : copy.auth.registerTitle}
              </CardTitle>
              <CardDescription>
                {mode === 'login' ? copy.auth.signInDesc : copy.auth.registerDesc}
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
                    <Label htmlFor="displayName">{copy.auth.displayName}</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={copy.auth.displayNamePlaceholder}
                      autoComplete="name"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">{copy.auth.email}</Label>
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
                  <Label htmlFor="password">{copy.auth.password}</Label>
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
                    <Label htmlFor="supervisorEmail">{copy.auth.supervisorEmail}</Label>
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
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading
                    ? copy.auth.submitting
                    : mode === 'login'
                      ? copy.auth.submitSignIn
                      : copy.auth.submitRegister}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                >
                  {mode === 'login' ? copy.auth.toggleToRegister : copy.auth.toggleToSignIn}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </section>
      </div>

    </AviationBackdrop>
  )
}
