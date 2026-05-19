export interface ShiftStats {
  open: number
  highPriority: number
  resolved: number
}

export function computeShiftStats(
  handoffs: { status: string; severity: string }[],
): ShiftStats {
  const openItems = handoffs.filter((h) => h.status === 'Open')
  return {
    open: openItems.length,
    highPriority: openItems.filter((h) => h.severity === 'High').length,
    resolved: handoffs.filter((h) => h.status === 'Resolved').length,
  }
}
