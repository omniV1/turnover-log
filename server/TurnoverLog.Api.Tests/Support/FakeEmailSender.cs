using TurnoverLog.Api.Services;

namespace TurnoverLog.Api.Tests.Support;

public sealed class FakeEmailSender : IEmailSender
{
    private readonly List<RecordedEmail> _sent = [];

    public IReadOnlyList<RecordedEmail> Sent => _sent;

    public Task SendAsync(
        string toAddress,
        string subject,
        string htmlBody,
        CancellationToken cancellationToken = default)
    {
        _sent.Add(new RecordedEmail(toAddress, subject, htmlBody));
        return Task.CompletedTask;
    }

    public void Clear() => _sent.Clear();
}

public sealed record RecordedEmail(string To, string Subject, string HtmlBody);
