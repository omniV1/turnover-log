import { useState } from 'react'
import { createHandoff } from '../api/handoffs'
import type { HandoffSeverity } from '../types/handoff'

interface CreateHandoffFormProps {
  onCreated: () => void
}

export function CreateHandoffForm({ onCreated }: CreateHandoffFormProps) {
  const [equipmentTag, setEquipmentTag] = useState('')
  const [summary, setSummary] = useState('')
  const [severity, setSeverity] = useState<HandoffSeverity>('Medium')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await createHandoff({
        equipmentTag: equipmentTag.trim(),
        summary: summary.trim(),
        severity,
      })
      setEquipmentTag('')
      setSummary('')
      setSeverity('Medium')
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create handoff')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-lg border border-slate-800 bg-slate-900 p-4"
    >
      <h2 className="mb-4 text-lg font-medium">Open new handoff</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="equipmentTag" className="block text-sm text-slate-400">
            Equipment tag
          </label>
          <input
            id="equipmentTag"
            required
            value={equipmentTag}
            onChange={(e) => setEquipmentTag(e.target.value)}
            placeholder="e.g. ACFT-01 / GEN-4"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-600"
          />
        </div>
        <div>
          <label htmlFor="severity" className="block text-sm text-slate-400">
            Severity
          </label>
          <select
            id="severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as HandoffSeverity)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-600"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="summary" className="block text-sm text-slate-400">
          Description / work performed
        </label>
        <textarea
          id="summary"
          required
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="What was found, actions taken, parts needed…"
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-600"
        />
      </div>
      {error && (
        <p className="mt-3 rounded border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-lg bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600 disabled:opacity-50"
      >
        {loading ? 'Opening…' : 'Open handoff (notify supervisor)'}
      </button>
    </form>
  )
}
