namespace TurnoverLog.Api.Configuration;

public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = "TurnoverLog";
    public string Audience { get; set; } = "TurnoverLogClient";
    public int ExpiresMinutes { get; set; } = 60;
}
