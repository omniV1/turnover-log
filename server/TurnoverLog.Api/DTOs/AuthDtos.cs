namespace TurnoverLog.Api.DTOs;

public record RegisterRequest(string Email, string Password, string SupervisorEmail, string? DisplayName);

public record LoginRequest(string Email, string Password);

public record AuthResponse(string Token, string Email, string DisplayName, DateTime ExpiresAtUtc);
