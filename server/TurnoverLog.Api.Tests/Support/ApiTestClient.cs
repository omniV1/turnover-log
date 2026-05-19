using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using TurnoverLog.Api.DTOs;
using TurnoverLog.Api.Models;

namespace TurnoverLog.Api.Tests.Support;

public static class ApiTestClient
{
    public static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() },
    };
    public static async Task<string> RegisterAndGetTokenAsync(
        HttpClient client,
        string email,
        string password,
        string supervisorEmail = "supervisor@test.local",
        string? displayName = null)
    {
        var register = new RegisterRequest(email, password, supervisorEmail, displayName);
        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", register);
        registerResponse.EnsureSuccessStatusCode();
        var auth = await registerResponse.Content.ReadFromJsonAsync<AuthResponse>(JsonOptions);
        return auth!.Token;
    }

    public static void SetBearer(HttpClient client, string token) =>
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

    public static async Task<HandoffEntryDto> CreateHandoffAsync(
        HttpClient client,
        string equipmentTag,
        string summary,
        HandoffSeverity severity = HandoffSeverity.Medium)
    {
        var request = new CreateHandoffRequest(equipmentTag, summary, severity);
        var response = await client.PostAsJsonAsync("/api/handoffs", request);
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<HandoffEntryDto>(JsonOptions))!;
    }
}
