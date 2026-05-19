using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using TurnoverLog.Api.Data;
using TurnoverLog.Api.Services;

namespace TurnoverLog.Api.Tests.Support;

public sealed class TurnoverLogWebApplicationFactory : WebApplicationFactory<TurnoverLog.Api.Program>
{
    private readonly string _databaseName = $"TurnoverLogTests_{Guid.NewGuid():N}";

    public FakeEmailSender EmailSender { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<TurnoverLogDbContext>>();
            services.RemoveAll<TurnoverLogDbContext>();

            services.AddDbContext<TurnoverLogDbContext>(options =>
                options.UseInMemoryDatabase(_databaseName));

            services.RemoveAll<IEmailSender>();
            services.AddSingleton<IEmailSender>(EmailSender);
        });
    }

    public async Task ResetDatabaseAsync()
    {
        EmailSender.Clear();

        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<TurnoverLogDbContext>();
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();
    }
}
