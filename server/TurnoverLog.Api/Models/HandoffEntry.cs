namespace TurnoverLog.Api.Models;

public class HandoffEntry
{
    public Guid Id { get; set; }
    public string EquipmentTag { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public HandoffSeverity Severity { get; set; }
    public HandoffStatus Status { get; set; } = HandoffStatus.Open;
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ResolvedAtUtc { get; set; }
}
