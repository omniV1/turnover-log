using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using TurnoverLog.Api.Configuration;

namespace TurnoverLog.Api.Services;

public class EmailSender : IEmailSender
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailSender> _logger;
    private readonly IWebHostEnvironment _environment;

    public EmailSender(
        IOptions<EmailSettings> settings,
        ILogger<EmailSender> logger,
        IWebHostEnvironment environment)
    {
        _settings = settings.Value;
        _logger = logger;
        _environment = environment;
    }

    public async Task SendAsync(
        string toAddress,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken = default)
    {
        if (!_settings.Enabled)
        {
            _logger.LogInformation("Email disabled; skipped send to {To}: {Subject}", toAddress, subject);
            return;
        }

        var message = BuildMessage(toAddress, subject, htmlBody);

        if (string.IsNullOrWhiteSpace(_settings.SmtpHost))
        {
            await WriteToOutboxAsync(message, cancellationToken);
            _logger.LogInformation(
                "Email (outbox): To={To} Subject={Subject} — see {Outbox}",
                toAddress,
                subject,
                Path.Combine(_environment.ContentRootPath, _settings.OutboxDirectory));
            return;
        }

        using var client = new SmtpClient();
        await client.ConnectAsync(
            _settings.SmtpHost,
            _settings.SmtpPort,
            _settings.UseSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto,
            cancellationToken);

        if (!string.IsNullOrWhiteSpace(_settings.SmtpUser))
            await client.AuthenticateAsync(_settings.SmtpUser, _settings.SmtpPassword, cancellationToken);

        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);

        _logger.LogInformation("Email sent to {To}: {Subject}", toAddress, subject);
    }

    private MimeMessage BuildMessage(string toAddress, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromAddress));
        message.To.Add(MailboxAddress.Parse(toAddress));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();
        return message;
    }

    private async Task WriteToOutboxAsync(MimeMessage message, CancellationToken cancellationToken)
    {
        var outbox = Path.Combine(_environment.ContentRootPath, _settings.OutboxDirectory);
        Directory.CreateDirectory(outbox);

        var safeSubject = string.Join("_", message.Subject.Split(Path.GetInvalidFileNameChars()));
        var fileName = $"{DateTime.UtcNow:yyyyMMddHHmmss}_{safeSubject}.eml";
        var path = Path.Combine(outbox, fileName);

        await using var stream = File.Create(path);
        await message.WriteToAsync(stream, cancellationToken);
    }
}
