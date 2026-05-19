export type HandoffSeverity = 'Low' | 'Medium' | 'High'
export type HandoffStatus = 'Open' | 'Resolved'

export interface HandoffEntry {
  id: string
  equipmentTag: string
  summary: string
  severity: HandoffSeverity
  status: HandoffStatus
  createdBy: string
  createdAtUtc: string
  resolvedBy: string | null
  resolvedAtUtc: string | null
}

export interface HealthResponse {
  status: string
  service: string
  utc: string
}
