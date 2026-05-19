namespace TurnoverLog.Api.Configuration;

public class EmailSettings
{
    public const string SectionName = "Email";

    /// <summary>When false, emails are written to logs only.</summary>
    public bool Enabled { get; set; } = true;

    /// <summary>Use SMTP when host is set; otherwise log/outbox only.</summary>
    public string? SmtpHost { get; set; }

    public int SmtpPort { get; set; } = 587;
    public bool UseSsl { get; set; } = true;
    public string? SmtpUser { get; set; }
    public string? SmtpPassword { get; set; }

    public string FromAddress { get; set; } = "noreply@turnoverlog.local";
    public string FromName { get; set; } = "Turnover Log";

    /// <summary>Used when a user has no supervisor email on file.</summary>
    public string? DefaultSupervisorEmail { get; set; }

    /// <summary>Dev: write .eml files under this folder (relative to content root).</summary>
    public string OutboxDirectory { get; set; } = "email-outbox";
}
