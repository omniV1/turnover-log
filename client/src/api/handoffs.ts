import { apiGet, apiPatch, apiPost } from './client'
import type { HandoffEntry, HandoffSeverity, HandoffStatus } from '../types/handoff'

export interface CreateHandoffRequest {
  equipmentTag: string
  summary: string
  severity: HandoffSeverity
}

export function fetchHandoffs(status?: HandoffStatus) {
  const query = status ? `?status=${status}` : ''
  return apiGet<HandoffEntry[]>(`/api/handoffs${query}`)
}

export function createHandoff(body: CreateHandoffRequest) {
  return apiPost<HandoffEntry>('/api/handoffs', body)
}

export function resolveHandoff(id: string) {
  return apiPatch<HandoffEntry>(`/api/handoffs/${id}/resolve`)
}
