namespace TurnoverLog.Api.Extensions;

public static class AuthRequestExtensions
{
    public static string NormalizeEmail(string email) =>
        email.Trim().ToLowerInvariant();
}
