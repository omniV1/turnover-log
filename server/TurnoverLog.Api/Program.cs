using Microsoft.EntityFrameworkCore;
using TurnoverLog.Api.Data;
using TurnoverLog.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<TurnoverLogDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var clientOrigin = builder.Configuration["ClientOrigin"] ?? "http://localhost:5173";
builder.Services.AddCors(options =>
{
    options.AddPolicy("Client", policy =>
        policy.WithOrigins(clientOrigin)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Client");
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TurnoverLogDbContext>();
    await db.Database.MigrateAsync();
    await SeedHandoffsAsync(db);
}

app.Run();

static async Task SeedHandoffsAsync(TurnoverLogDbContext db)
{
    if (await db.HandoffEntries.AnyAsync())
        return;

    db.HandoffEntries.AddRange(
        new HandoffEntry
        {
            Id = Guid.NewGuid(),
            EquipmentTag = "AC-001",
            Summary = "Hydraulic leak noted on left main — pad kept clear, awaiting parts.",
            Severity = HandoffSeverity.High,
            Status = HandoffStatus.Open,
            CreatedBy = "demo.shift-a",
            CreatedAtUtc = DateTime.UtcNow.AddHours(-6)
        },
        new HandoffEntry
        {
            Id = Guid.NewGuid(),
            EquipmentTag = "AC-014",
            Summary = "Daily inspection complete; no discrepancies.",
            Severity = HandoffSeverity.Low,
            Status = HandoffStatus.Resolved,
            CreatedBy = "demo.shift-b",
            CreatedAtUtc = DateTime.UtcNow.AddHours(-12),
            ResolvedAtUtc = DateTime.UtcNow.AddHours(-10)
        });

    await db.SaveChangesAsync();
}
