using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TurnoverLog.Api.Configuration;
using TurnoverLog.Api.Data;
using TurnoverLog.Api.Models;
using TurnoverLog.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException("Jwt configuration is required.");

if (string.IsNullOrWhiteSpace(jwtSettings.Key) || jwtSettings.Key.Length < 32)
    throw new InvalidOperationException("Jwt:Key must be at least 32 characters.");

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Turnover Log API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" },
            },
            Array.Empty<string>()
        },
    });
});

builder.Services.AddDbContext<TurnoverLogDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.Password.RequiredLength = 8;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireDigit = true;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<TurnoverLogDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<TokenService>();

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
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TurnoverLogDbContext>();
    await db.Database.MigrateAsync();
    await SeedDataAsync(scope.ServiceProvider, db);
}

app.Run();

static async Task SeedDataAsync(IServiceProvider services, TurnoverLogDbContext db)
{
    await SeedDemoUserAsync(services);
    await SeedHandoffsAsync(db);
}

static async Task SeedDemoUserAsync(IServiceProvider services)
{
    const string demoEmail = "demo@turnover.local";
    const string demoPassword = "Demo1234!";

    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
    if (await userManager.FindByEmailAsync(demoEmail) is not null)
        return;

    var user = new ApplicationUser
    {
        UserName = demoEmail,
        Email = demoEmail,
        EmailConfirmed = true,
        DisplayName = "demo.shift-lead",
    };

    var result = await userManager.CreateAsync(user, demoPassword);
    if (!result.Succeeded)
    {
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("Seed");
        logger.LogWarning("Demo user seed failed: {Errors}",
            string.Join(", ", result.Errors.Select(e => e.Description)));
    }
}

static async Task SeedHandoffsAsync(TurnoverLogDbContext db)
{
    if (await db.HandoffEntries.AnyAsync())
        return;

    var now = DateTime.UtcNow;
    db.HandoffEntries.AddRange(
        new HandoffEntry
        {
            Id = Guid.NewGuid(),
            EquipmentTag = "AC-001",
            Summary = "Hydraulic leak noted on left main — pad kept clear, awaiting parts.",
            Severity = HandoffSeverity.High,
            Status = HandoffStatus.Open,
            CreatedBy = "demo.shift-lead",
            CreatedAtUtc = now.AddHours(-6),
        },
        new HandoffEntry
        {
            Id = Guid.NewGuid(),
            EquipmentTag = "AC-014",
            Summary = "Daily inspection complete; no discrepancies.",
            Severity = HandoffSeverity.Low,
            Status = HandoffStatus.Resolved,
            CreatedBy = "demo.shift-b",
            CreatedAtUtc = now.AddHours(-12),
            ResolvedAtUtc = now.AddHours(-10),
        },
        new HandoffEntry
        {
            Id = Guid.NewGuid(),
            EquipmentTag = "AC-007",
            Summary = "Avionics bay door seal worn — replacement ordered.",
            Severity = HandoffSeverity.Medium,
            Status = HandoffStatus.Open,
            CreatedBy = "demo.shift-lead",
            CreatedAtUtc = now.AddHours(-4),
        },
        new HandoffEntry
        {
            Id = Guid.NewGuid(),
            EquipmentTag = "AC-022",
            Summary = "Brake wear pins at minimum — schedule change before next sortie.",
            Severity = HandoffSeverity.High,
            Status = HandoffStatus.Open,
            CreatedBy = "demo.shift-a",
            CreatedAtUtc = now.AddHours(-2),
        },
        new HandoffEntry
        {
            Id = Guid.NewGuid(),
            EquipmentTag = "AC-003",
            Summary = "Post-flight walkaround complete; minor paint chip logged.",
            Severity = HandoffSeverity.Low,
            Status = HandoffStatus.Open,
            CreatedBy = "demo.shift-c",
            CreatedAtUtc = now.AddHours(-1),
        });

    await db.SaveChangesAsync();
}
