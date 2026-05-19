using Microsoft.EntityFrameworkCore;
using TurnoverLog.Api.Data;

namespace TurnoverLog.Api.Configuration;

public enum DatabaseProvider
{
    SqlServer,
    PostgreSql,
}

public static class DatabaseConfiguration
{
    public static DatabaseProvider AddTurnoverLogDatabase(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var (provider, connectionString) = ResolveConnection(configuration);

        services.AddDbContext<TurnoverLogDbContext>(options =>
        {
            if (provider == DatabaseProvider.PostgreSql)
            {
                options.UseNpgsql(
                    connectionString,
                    npgsql => npgsql.MigrationsHistoryTable(
                        "__EFMigrationsHistory",
                        "public"));
            }
            else
            {
                options.UseSqlServer(connectionString);
            }
        });

        return provider;
    }

    public static async Task MigrateTurnoverLogDatabaseAsync(
        this WebApplication app,
        DatabaseProvider provider)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<TurnoverLogDbContext>();

        if (provider == DatabaseProvider.PostgreSql)
        {
            await db.Database.EnsureCreatedAsync();
            await NotificationSchemaBootstrap.EnsureAsync(db, provider);
            return;
        }

        await db.Database.MigrateAsync();
    }

    private static (DatabaseProvider Provider, string ConnectionString) ResolveConnection(
        IConfiguration configuration)
    {
        var databaseUrl = configuration["DATABASE_URL"];
        if (!string.IsNullOrWhiteSpace(databaseUrl))
        {
            return (DatabaseProvider.PostgreSql, ParseRenderPostgresUrl(databaseUrl));
        }

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Connection string 'DefaultConnection' or DATABASE_URL is required.");
        }

        if (connectionString.Contains("Host=", StringComparison.OrdinalIgnoreCase))
        {
            return (DatabaseProvider.PostgreSql, connectionString);
        }

        return (DatabaseProvider.SqlServer, connectionString);
    }

    /// <summary>Render and Heroku expose postgres://user:pass@host:port/db</summary>
    public static string ParseRenderPostgresUrl(string databaseUrl)
    {
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':', 2);
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;
        var database = uri.AbsolutePath.TrimStart('/');
        var port = uri.Port > 0 ? uri.Port : 5432;

        return
            $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
    }
}
