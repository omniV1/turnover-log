using TurnoverLog.Api.Models;

namespace TurnoverLog.Api.DTOs;

public static class HandoffMapper
{
    public static HandoffEntryDto ToDto(HandoffEntry entry) =>
        new(
            entry.Id,
            entry.EquipmentTag,
            entry.Summary,
            entry.Severity,
            entry.Status,
            entry.CreatedBy,
            entry.CreatedAtUtc,
            entry.ResolvedBy,
            entry.ResolvedAtUtc);
}
