import { apiGet } from './client'
import type { SupervisorNotification } from '../types/notification'

export function fetchSupervisorInbox() {
  return apiGet<SupervisorNotification[]>('/api/notifications')
}
