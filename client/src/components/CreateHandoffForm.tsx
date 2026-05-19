import { useState } from 'react'
import { createHandoff } from '../api/handoffs'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { primaryButtonClass } from '../styles/forms'
import type { HandoffSeverity } from '../types/handoff'
import { FormError, SelectField, TextArea, TextInput } from './ui/FormField'

const SEVERITY_OPTIONS: HandoffSeverity[] = ['Low', 'Medium', 'High']

interface CreateHandoffFormProps {
  onCreated: () => void
}

export function CreateHandoffForm({ onCreated }: CreateHandoffFormProps) {
  const [equipmentTag, setEquipmentTag] = useState('')
  const [summary, setSummary] = useState('')
  const [severity, setSeverity] = useState<HandoffSeverity>('Medium')
  const { error, loading, run } = useAsyncAction()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const created = await run(
      () =>
        createHandoff({
          equipmentTag: equipmentTag.trim(),
          summary: summary.trim(),
          severity,
        }),
      'Failed to create handoff',
    )

    if (!created) return

    setEquipmentTag('')
    setSummary('')
    setSeverity('Medium')
    onCreated()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-lg border border-slate-800 bg-slate-900 p-4"
    >
      <h2 className="mb-4 text-lg font-medium">Open new handoff</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          id="equipmentTag"
          label="Equipment tag"
          required
          value={equipmentTag}
          onChange={(e) => setEquipmentTag(e.target.value)}
          placeholder="e.g. ACFT-01 / GEN-4"
        />
        <SelectField
          id="severity"
          label="Severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value as HandoffSeverity)}
        >
          {SEVERITY_OPTIONS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="mt-4">
        <TextArea
          id="summary"
          label="Description / work performed"
          required
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="What was found, actions taken, parts needed…"
        />
      </div>
      {error && (
        <div className="mt-3">
          <FormError message={error} />
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className={`mt-4 px-4 py-2 text-sm ${primaryButtonClass}`}
      >
        {loading ? 'Opening…' : 'Open handoff (notify supervisor)'}
      </button>
    </form>
  )
}
