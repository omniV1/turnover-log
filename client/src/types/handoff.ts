export type HandoffSeverity = 'Low' | 'Medium' | 'High'
export type HandoffStatus = 'Open' | 'Resolved'

export interface HandoffEntry {
  id: string
  equipmentTag: string
  summary: string
  severity: HandoffSeverity | number
  status: HandoffStatus | number
  createdBy: string
  createdAtUtc: string
  resolvedAtUtc: string | null
}

export interface HealthResponse {
  status: string
  service: string
  utc: string
}
