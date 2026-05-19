import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createHandoff } from '@/api/handoffs'
import { useAsyncAction } from '@/hooks/useAsyncAction'
import type { HandoffSeverity } from '@/types/handoff'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="size-4 text-primary" />
          Open new handoff
        </CardTitle>
        <CardDescription>
          Creates a shift record and notifies the supervisor inbox.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="equipmentTag">Equipment tag</Label>
              <Input
                id="equipmentTag"
                required
                placeholder="e.g. ACFT-01 / GEN-4"
                value={equipmentTag}
                onChange={(e) => setEquipmentTag(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={severity}
                onValueChange={(value) => setSeverity(value as HandoffSeverity)}
              >
                <SelectTrigger id="severity" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Description / work performed</Label>
            <Textarea
              id="summary"
              required
              rows={3}
              placeholder="What was found, actions taken, parts needed…"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Opening…' : 'Open handoff'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
