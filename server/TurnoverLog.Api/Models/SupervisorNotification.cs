namespace TurnoverLog.Api.Models;

public class SupervisorNotification
{
    public Guid Id { get; set; }
    public string SupervisorEmail { get; set; } = string.Empty;
    public Guid HandoffId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string BodyHtml { get; set; } = string.Empty;
    public string EquipmentTag { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public bool EmailSent { get; set; }
}
