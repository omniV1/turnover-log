namespace TurnoverLog.Api.DTOs;

public record SupervisorNotificationDto(
    Guid Id,
    Guid HandoffId,
    string EventType,
    string Subject,
    string EquipmentTag,
    string Summary,
    DateTime CreatedAtUtc,
    bool EmailSent);
