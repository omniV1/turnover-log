import type { HandoffEntry, HandoffStatus } from '../types/handoff'

const STATUS_FILTERS = ['Open', 'Resolved', 'All'] as const
export type StatusFilter = (typeof STATUS_FILTERS)[number]

export const STATUS_FILTER_OPTIONS: readonly StatusFilter[] = STATUS_FILTERS

export function formatUtc(iso: string): string {
  return new Date(iso).toLocaleString()
}

export function isHandoffOpen(entry: HandoffEntry): boolean {
  return entry.status === 'Open'
}

export function handoffListTitle(filter: StatusFilter): string {
  switch (filter) {
    case 'Open':
      return 'Open handoffs'
    case 'Resolved':
      return 'Resolved handoffs'
    default:
      return 'All handoffs'
  }
}

export function toApiStatusFilter(
  filter: StatusFilter,
): HandoffStatus | undefined {
  return filter === 'All' ? undefined : filter
}
