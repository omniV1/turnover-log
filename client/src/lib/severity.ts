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

export function severityAccentClass(severity: HandoffSeverity): string {
  switch (severity) {
    case 'High':
      return 'border-l-4 border-l-amber-500'
    case 'Medium':
      return 'border-l-4 border-l-sky-400'
    default:
      return 'border-l-4 border-l-emerald-500/60'
  }
}

export function severityGlowClass(severity: HandoffSeverity): string {
  switch (severity) {
    case 'High':
      return 'hover:shadow-amber-500/10'
    case 'Medium':
      return 'hover:shadow-sky-500/10'
    default:
      return 'hover:shadow-emerald-500/5'
  }
}
