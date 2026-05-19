using System.Text;
using Microsoft.Extensions.Options;
using TurnoverLog.Api.Configuration;
using TurnoverLog.Api.Data;
using TurnoverLog.Api.Extensions;
using TurnoverLog.Api.Models;

namespace TurnoverLog.Api.Services;

public enum HandoffNotificationEvent
{
    Opened,
    Closed,
}

public class HandoffNotificationService
{
    private readonly TurnoverLogDbContext _db;
    private readonly IEmailSender _emailSender;
    private readonly EmailSettings _emailSettings;
    private readonly ILogger<HandoffNotificationService> _logger;

    public HandoffNotificationService(
        TurnoverLogDbContext db,
        IEmailSender emailSender,
        IOptions<EmailSettings> emailSettings,
        ILogger<HandoffNotificationService> logger)
    {
        _db = db;
        _emailSender = emailSender;
        _emailSettings = emailSettings.Value;
        _logger = logger;
    }

    public async Task NotifySupervisorAsync(
        HandoffEntry entry,
        HandoffNotificationEvent notificationEvent,
        ApplicationUser actingUser,
        CancellationToken cancellationToken = default)
    {
        var supervisorEmail = ResolveSupervisorEmail(actingUser);
        if (string.IsNullOrWhiteSpace(supervisorEmail))
            return;

        var subject = BuildSubject(entry, notificationEvent);
        var html = BuildHtml(entry, notificationEvent, actingUser);

        var notification = new SupervisorNotification
        {
            Id = Guid.NewGuid(),
            SupervisorEmail = supervisorEmail,
            HandoffId = entry.Id,
            EventType = notificationEvent.ToString(),
            Subject = subject,
            BodyHtml = html,
            EquipmentTag = entry.EquipmentTag,
            Summary = entry.Summary,
            CreatedAtUtc = DateTime.UtcNow,
            EmailSent = false,
        };

        _db.SupervisorNotifications.Add(notification);
        await _db.SaveChangesAsync(cancellationToken);

        if (ShouldAttemptEmail())
        {
            await _emailSender.SendAsync(supervisorEmail, subject, html, cancellationToken);
            notification.EmailSent = true;
            await _db.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Supervisor notified by email: {To} {Subject}", supervisorEmail, subject);
        }
        else
        {
            _logger.LogInformation(
                "Supervisor notification saved to inbox (no SMTP): {To} {Subject}",
                supervisorEmail,
                subject);
        }
    }

    private bool ShouldAttemptEmail() =>
        _emailSettings.Enabled && !string.IsNullOrWhiteSpace(_emailSettings.SmtpHost);

    private string? ResolveSupervisorEmail(ApplicationUser actingUser)
    {
        if (!string.IsNullOrWhiteSpace(actingUser.SupervisorEmail))
            return actingUser.SupervisorEmail.Trim().ToLowerInvariant();

        return string.IsNullOrWhiteSpace(_emailSettings.DefaultSupervisorEmail)
            ? null
            : _emailSettings.DefaultSupervisorEmail.Trim().ToLowerInvariant();
    }

    private static string BuildSubject(HandoffEntry entry, HandoffNotificationEvent notificationEvent) =>
        notificationEvent switch
        {
            HandoffNotificationEvent.Opened =>
                $"[Turnover Log] OPEN — {entry.EquipmentTag} ({entry.Severity})",
            HandoffNotificationEvent.Closed =>
                $"[Turnover Log] CLOSED — {entry.EquipmentTag}",
            _ => $"[Turnover Log] Update — {entry.EquipmentTag}",
        };

    private static string BuildHtml(HandoffEntry entry, HandoffNotificationEvent evt, ApplicationUser actor)
    {
        var actorName = actor.GetDisplayName();
        var status = evt == HandoffNotificationEvent.Opened ? "OPENED" : "CLOSED";
        var duration = entry.ResolvedAtUtc.HasValue
            ? FormatDuration(entry.CreatedAtUtc, entry.ResolvedAtUtc.Value)
            : "In progress";

        var sb = new StringBuilder();
        sb.Append("<html><body style=\"font-family:Segoe UI,Arial,sans-serif;color:#1e293b;\">");
        sb.Append($"<h2 style=\"color:#0e7490;\">Maintenance handoff — {status}</h2>");
        sb.Append("<table style=\"border-collapse:collapse;width:100%;max-width:560px;\">");
        AppendRow(sb, "Equipment", entry.EquipmentTag);
        AppendRow(sb, "Severity", entry.Severity.ToString());
        AppendRow(sb, "Status", entry.Status.ToString());
        AppendRow(sb, "Description", entry.Summary);
        AppendRow(sb, "Opened at (UTC)", entry.CreatedAtUtc.ToString("yyyy-MM-dd HH:mm"));
        AppendRow(sb, "Opened by", entry.CreatedBy);
        if (entry.ResolvedAtUtc.HasValue)
        {
            AppendRow(sb, "Closed at (UTC)", entry.ResolvedAtUtc.Value.ToString("yyyy-MM-dd HH:mm"));
            AppendRow(sb, "Closed by", entry.ResolvedBy ?? "—");
            AppendRow(sb, "Time open", duration);
        }
        AppendRow(sb, "Action by", actorName);
        AppendRow(sb, "Reference ID", entry.Id.ToString());
        sb.Append("</table>");
        sb.Append("<p style=\"font-size:12px;color:#64748b;margin-top:24px;\">");
        sb.Append("Automated notification from Turnover Log. Do not reply to this message.");
        sb.Append("</p></body></html>");
        return sb.ToString();
    }

    private static void AppendRow(StringBuilder sb, string label, string value)
    {
        sb.Append("<tr><td style=\"padding:8px;border:1px solid #e2e8f0;font-weight:600;width:140px;\">");
        sb.Append(System.Net.WebUtility.HtmlEncode(label));
        sb.Append("</td><td style=\"padding:8px;border:1px solid #e2e8f0;\">");
        sb.Append(System.Net.WebUtility.HtmlEncode(value));
        sb.Append("</td></tr>");
    }

    private static string FormatDuration(DateTime start, DateTime end)
    {
        var span = end - start;
        if (span.TotalHours >= 1)
            return $"{(int)span.TotalHours}h {span.Minutes}m";
        return $"{(int)span.TotalMinutes}m";
    }
}
