import { useState } from 'react'
import { login, register } from '../api/auth'
import { setSession } from '../auth/storage'
import type { StoredUser } from '../auth/storage'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { primaryButtonClass } from '../styles/forms'
import { FormError, TextInput } from './ui/FormField'

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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-slate-100">Turnover Log</h1>
        <p className="mt-1 text-sm text-slate-400">Sign in to view shift handoffs</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <TextInput
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextInput
            id="password"
            label="Password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {mode === 'register' && (
            <>
              <TextInput
                id="supervisorEmail"
                label="Supervisor email (notified on open/close)"
                type="email"
                required
                value={supervisorEmail}
                onChange={(e) => setSupervisorEmail(e.target.value)}
              />
              <TextInput
                id="displayName"
                label="Display name (optional)"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </>
          )}

          {error && <FormError message={error} />}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 ${primaryButtonClass}`}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button
                type="button"
                className="text-cyan-400 hover:underline"
                onClick={() => setMode('register')}
              >
                Register
              </button>
            </>
          ) : (
            <>
              Have an account?{' '}
              <button
                type="button"
                className="text-cyan-400 hover:underline"
                onClick={() => setMode('login')}
              >
                Sign in
              </button>
            </>
          )}
        </p>

        <p className="mt-4 rounded border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-500">
          Demo: <span className="text-slate-400">demo@turnover.local</span> /{' '}
          <span className="text-slate-400">Demo1234!</span>
        </p>
      </div>
    </div>
  )
}
