using System.Text;
using Microsoft.AspNetCore.Identity;
using TurnoverLog.Api.Configuration;
using TurnoverLog.Api.Models;

namespace TurnoverLog.Api.Services;

public enum HandoffNotificationEvent
{
    Opened,
    Closed,
}

public class HandoffNotificationService
{
    private readonly IEmailSender _emailSender;
    private readonly EmailSettings _emailSettings;

    public HandoffNotificationService(
        IEmailSender emailSender,
        Microsoft.Extensions.Options.IOptions<EmailSettings> emailSettings)
    {
        _emailSender = emailSender;
        _emailSettings = emailSettings.Value;
    }

    public async Task NotifySupervisorAsync(
        HandoffEntry entry,
        HandoffNotificationEvent notificationEvent,
        ApplicationUser actingUser,
        CancellationToken cancellationToken = default)
    {
        var supervisorEmail = ResolveSupervisorEmail(actingUser);
        if (string.IsNullOrWhiteSpace(supervisorEmail))
        {
            return;
        }

        var subject = notificationEvent switch
        {
            HandoffNotificationEvent.Opened =>
                $"[Turnover Log] OPEN — {entry.EquipmentTag} ({entry.Severity})",
            HandoffNotificationEvent.Closed =>
                $"[Turnover Log] CLOSED — {entry.EquipmentTag}",
            _ => $"[Turnover Log] Update — {entry.EquipmentTag}",
        };

        var html = BuildHtml(entry, notificationEvent, actingUser);
        await _emailSender.SendAsync(supervisorEmail, subject, html, cancellationToken);
    }

    private string? ResolveSupervisorEmail(ApplicationUser actingUser)
    {
        if (!string.IsNullOrWhiteSpace(actingUser.SupervisorEmail))
            return actingUser.SupervisorEmail.Trim();

        return string.IsNullOrWhiteSpace(_emailSettings.DefaultSupervisorEmail)
            ? null
            : _emailSettings.DefaultSupervisorEmail.Trim();
    }

    private static string BuildHtml(HandoffEntry entry, HandoffNotificationEvent evt, ApplicationUser actor)
    {
        var actorName = actor.DisplayName ?? actor.Email ?? "Unknown";
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
