import type { HandoffSeverity } from '@/types/handoff'

export function severityBadgeVariant(
  severity: HandoffSeverity,
): 'default' | 'secondary' | 'destructive' {
  switch (severity) {
    case 'High':
      return 'destructive'
    case 'Medium':
      return 'default'
    default:
      return 'secondary'
  }
}
