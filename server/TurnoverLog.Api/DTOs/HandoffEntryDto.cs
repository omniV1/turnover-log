using TurnoverLog.Api.Models;

namespace TurnoverLog.Api.DTOs;

public record HandoffEntryDto(
    Guid Id,
    string EquipmentTag,
    string Summary,
    HandoffSeverity Severity,
    HandoffStatus Status,
    string CreatedBy,
    DateTime CreatedAtUtc,
    DateTime? ResolvedAtUtc);

public record CreateHandoffRequest(
    string EquipmentTag,
    string Summary,
    HandoffSeverity Severity,
    string CreatedBy);
