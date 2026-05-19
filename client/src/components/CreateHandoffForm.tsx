import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { createHandoff } from '@/api/handoffs'
import { useAsyncAction } from '@/hooks/useAsyncAction'
import { cn } from '@/lib/utils'
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
  const [expanded, setExpanded] = useState(true)
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
    <Card className="glass-panel">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((v) => !v)
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-4 text-primary" />
              Log new handoff
            </CardTitle>
            <CardDescription>
              Record equipment findings for shift turnover and supervisor visibility.
            </CardDescription>
          </div>
          <ChevronDown
            className={cn(
              'size-5 shrink-0 text-muted-foreground transition-transform duration-200',
              expanded && 'rotate-180',
            )}
          />
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="animate-fade-up border-t border-border/40 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="equipmentTag">Equipment / tail tag</Label>
                <Input
                  id="equipmentTag"
                  required
                  className="font-mono uppercase"
                  placeholder="N123AB · GEN-4 · ACFT-01"
                  value={equipmentTag}
                  onChange={(e) => setEquipmentTag(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Priority</Label>
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
              <Label htmlFor="summary">Squawk / work performed</Label>
              <Textarea
                id="summary"
                required
                rows={3}
                placeholder="Describe the discrepancy, troubleshooting steps, parts ordered, or MEL status…"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Submitting…' : 'Submit to shift log'}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  )
}
