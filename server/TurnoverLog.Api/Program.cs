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

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
    builder.WebHost.UseUrls($"http://+:{port}");

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection(EmailSettings.SectionName));
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

var databaseProvider = builder.Services.AddTurnoverLogDatabase(builder.Configuration);

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
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<HandoffNotificationService>();
builder.Services.AddSingleton<IEmailSender, EmailSender>();

builder.Services.AddTurnoverLogCors(builder.Configuration);

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

if (!app.Environment.IsEnvironment("Testing"))
{
    await app.MigrateTurnoverLogDatabaseAsync(databaseProvider);

    using var scope = app.Services.CreateScope();
    await SeedDataAsync(scope.ServiceProvider);
}

app.Run();

static async Task SeedDataAsync(IServiceProvider services)
{
    await SeedDemoUserAsync(services);
    await SeedSupervisorUserAsync(services);
}

static async Task SeedDemoUserAsync(IServiceProvider services)
{
    const string demoEmail = "demo@turnover.local";
    const string demoPassword = "Demo1234!";

    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
    var existing = await userManager.FindByEmailAsync(demoEmail);
    if (existing is not null)
    {
        if (string.IsNullOrWhiteSpace(existing.SupervisorEmail))
        {
            existing.SupervisorEmail = "supervisor@turnover.local";
            await userManager.UpdateAsync(existing);
        }
        return;
    }

    var user = new ApplicationUser
    {
        UserName = demoEmail,
        Email = demoEmail,
        EmailConfirmed = true,
        DisplayName = "demo.shift-lead",
        SupervisorEmail = "supervisor@turnover.local",
    };

    var result = await userManager.CreateAsync(user, demoPassword);
    if (!result.Succeeded)
    {
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("Seed");
        logger.LogWarning("Demo user seed failed: {Errors}",
            string.Join(", ", result.Errors.Select(e => e.Description)));
    }
}

static async Task SeedSupervisorUserAsync(IServiceProvider services)
{
    const string supervisorEmail = "supervisor@turnover.local";
    const string password = "Demo1234!";

    var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
    if (await userManager.FindByEmailAsync(supervisorEmail) is not null)
        return;

    var user = new ApplicationUser
    {
        UserName = supervisorEmail,
        Email = supervisorEmail,
        EmailConfirmed = true,
        DisplayName = "supervisor.lead",
        SupervisorEmail = supervisorEmail,
    };

    var result = await userManager.CreateAsync(user, password);
    if (!result.Succeeded)
    {
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("Seed");
        logger.LogWarning("Supervisor user seed failed: {Errors}",
            string.Join(", ", result.Errors.Select(e => e.Description)));
    }
}
