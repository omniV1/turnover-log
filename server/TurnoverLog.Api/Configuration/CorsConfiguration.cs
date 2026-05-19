namespace TurnoverLog.Api.Configuration;

public static class CorsConfiguration
{
    public static IServiceCollection AddTurnoverLogCors(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var allowedOrigins = configuration["ClientOrigin"]?
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            ?? ["http://localhost:5173"];

        services.AddCors(options =>
        {
            options.AddPolicy("Client", policy =>
                policy.SetIsOriginAllowed(origin => IsAllowedOrigin(origin, allowedOrigins))
                    .AllowAnyHeader()
                    .AllowAnyMethod());
        });

        return services;
    }

    private static bool IsAllowedOrigin(string? origin, string[] allowedOrigins)
    {
        if (string.IsNullOrWhiteSpace(origin))
            return false;

        if (allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
            return true;

        if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
            return false;

        return uri.Scheme is "https" or "http"
            && uri.Host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase);
    }
}
