import { useState } from 'react'
import { login, register } from '../api/auth'
import { setSession } from '../auth/storage'
import type { StoredUser } from '../auth/storage'

interface LoginPageProps {
  onAuthenticated: (user: StoredUser) => void
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('demo@turnover.local')
  const [password, setPassword] = useState('Demo1234!')
  const [displayName, setDisplayName] = useState('')
  const [supervisorEmail, setSupervisorEmail] = useState('supervisor@turnover.local')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response =
        mode === 'login'
          ? await login({ email, password })
          : await register({
              email,
              password,
              supervisorEmail,
              displayName: displayName.trim() || undefined,
            })

      const user: StoredUser = {
        email: response.email,
        displayName: response.displayName,
      }
      setSession(response.token, user)
      onAuthenticated(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-slate-100">Turnover Log</h1>
        <p className="mt-1 text-sm text-slate-400">Sign in to view shift handoffs</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-slate-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-600"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-slate-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-600"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="supervisorEmail" className="block text-sm text-slate-400">
                Supervisor email (notified on open/close)
              </label>
              <input
                id="supervisorEmail"
                type="email"
                required
                value={supervisorEmail}
                onChange={(e) => setSupervisorEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-600"
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label htmlFor="displayName" className="block text-sm text-slate-400">
                Display name (optional)
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-600"
              />
            </div>
          )}

          {error && (
            <p className="rounded border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-700 py-2.5 font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
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
