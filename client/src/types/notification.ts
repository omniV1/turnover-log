export interface SupervisorNotification {
  id: string
  handoffId: string
  eventType: string
  subject: string
  equipmentTag: string
  summary: string
  createdAtUtc: string
  emailSent: boolean
}
