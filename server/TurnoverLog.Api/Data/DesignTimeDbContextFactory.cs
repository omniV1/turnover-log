using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace TurnoverLog.Api.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<TurnoverLogDbContext>
{
    public TurnoverLogDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<TurnoverLogDbContext>();
        var provider = Environment.GetEnvironmentVariable("DB_PROVIDER") ?? "SqlServer";

        if (string.Equals(provider, "Postgres", StringComparison.OrdinalIgnoreCase))
        {
            var connection = Environment.GetEnvironmentVariable("DATABASE_URL")
                ?? "Host=localhost;Port=5432;Database=turnoverlog;Username=postgres;Password=postgres";
            if (connection.StartsWith("postgres", StringComparison.OrdinalIgnoreCase))
            {
                connection = TurnoverLog.Api.Configuration.DatabaseConfiguration.ParseRenderPostgresUrl(connection);
            }

            optionsBuilder.UseNpgsql(connection);
        }
        else
        {
            optionsBuilder.UseSqlServer(
                "Server=(localdb)\\mssqllocaldb;Database=TurnoverLog;Trusted_Connection=True;TrustServerCertificate=True");
        }

        return new TurnoverLogDbContext(optionsBuilder.Options);
    }
}
