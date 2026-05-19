using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using TurnoverLog.Api.Data;
using TurnoverLog.Api.DTOs;
using TurnoverLog.Api.Models;
using TurnoverLog.Api.Tests.Support;

namespace TurnoverLog.Api.Tests;

public class HandoffsEndpointTests : IClassFixture<TurnoverLogWebApplicationFactory>
{
    private readonly TurnoverLogWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public HandoffsEndpointTests(TurnoverLogWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetHandoffs_WithoutToken_ReturnsUnauthorized()
    {
        await _factory.ResetDatabaseAsync();

        var response = await _client.GetAsync("/api/handoffs");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateResolveAndFilter_Handoffs_WorkEndToEnd()
    {
        await _factory.ResetDatabaseAsync();

        var token = await ApiTestClient.RegisterAndGetTokenAsync(
            _client,
            $"tech-{Guid.NewGuid():N}@test.local",
            "Test1234!",
            "lead@test.local",
            "test.tech");

        ApiTestClient.SetBearer(_client, token);

        var created = await ApiTestClient.CreateHandoffAsync(
            _client,
            "GEN-4",
            "Generator oil pressure low — monitoring overnight.",
            HandoffSeverity.High);

        Assert.Equal(HandoffStatus.Open, created.Status);
        Assert.Equal("GEN-4", created.EquipmentTag);
        Assert.Equal("test.tech", created.CreatedBy);

        var openList = await _client.GetFromJsonAsync<List<HandoffEntryDto>>(
            "/api/handoffs?status=Open",
            ApiTestClient.JsonOptions);
        Assert.NotNull(openList);
        Assert.Contains(openList, h => h.Id == created.Id);

        var resolveResponse = await _client.PatchAsync($"/api/handoffs/{created.Id}/resolve", null);
        Assert.Equal(HttpStatusCode.OK, resolveResponse.StatusCode);

        var resolved = await resolveResponse.Content.ReadFromJsonAsync<HandoffEntryDto>(
            ApiTestClient.JsonOptions);
        Assert.NotNull(resolved);
        Assert.Equal(HandoffStatus.Resolved, resolved.Status);
        Assert.Equal("test.tech", resolved.ResolvedBy);
        Assert.NotNull(resolved.ResolvedAtUtc);

        var resolvedList = await _client.GetFromJsonAsync<List<HandoffEntryDto>>(
            "/api/handoffs?status=Resolved",
            ApiTestClient.JsonOptions);
        Assert.Contains(resolvedList!, h => h.Id == created.Id);

        var openAfter = await _client.GetFromJsonAsync<List<HandoffEntryDto>>(
            "/api/handoffs?status=Open",
            ApiTestClient.JsonOptions);
        Assert.DoesNotContain(openAfter!, h => h.Id == created.Id);
    }

    [Fact]
    public async Task CreateHandoff_SendsOpenNotificationToSupervisor()
    {
        await _factory.ResetDatabaseAsync();

        const string supervisor = "supervisor@test.local";
        var token = await ApiTestClient.RegisterAndGetTokenAsync(
            _client,
            $"tech-{Guid.NewGuid():N}@test.local",
            "Test1234!",
            supervisor);

        ApiTestClient.SetBearer(_client, token);

        await ApiTestClient.CreateHandoffAsync(
            _client,
            "AC-99",
            "Hydraulic leak contained — parts on order.",
            HandoffSeverity.High);

        var email = Assert.Single(_factory.EmailSender.Sent);
        Assert.Equal(supervisor, email.To);
        Assert.Contains("OPEN", email.Subject, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("AC-99", email.Subject);
        Assert.Contains("Hydraulic leak", email.HtmlBody);
    }

    [Fact]
    public async Task ResolveHandoff_SendsClosedNotificationWithDuration()
    {
        await _factory.ResetDatabaseAsync();

        const string supervisor = "supervisor@test.local";
        var token = await ApiTestClient.RegisterAndGetTokenAsync(
            _client,
            $"tech-{Guid.NewGuid():N}@test.local",
            "Test1234!",
            supervisor);

        ApiTestClient.SetBearer(_client, token);

        var created = await ApiTestClient.CreateHandoffAsync(
            _client,
            "AC-12",
            "Brake wear at minimum.",
            HandoffSeverity.Medium);

        _factory.EmailSender.Clear();

        var resolveResponse = await _client.PatchAsync($"/api/handoffs/{created.Id}/resolve", null);
        resolveResponse.EnsureSuccessStatusCode();

        var email = Assert.Single(_factory.EmailSender.Sent);
        Assert.Equal(supervisor, email.To);
        Assert.Contains("CLOSED", email.Subject, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("AC-12", email.Subject);
        Assert.Contains("Closed by", email.HtmlBody);
        Assert.Contains("Time open", email.HtmlBody);
    }

    [Fact]
    public async Task CreateHandoff_StoresSupervisorInboxNotification()
    {
        await _factory.ResetDatabaseAsync();

        const string supervisor = "inbox-only@test.local";
        var token = await ApiTestClient.RegisterAndGetTokenAsync(
            _client,
            $"tech-{Guid.NewGuid():N}@test.local",
            "Test1234!",
            supervisor);

        ApiTestClient.SetBearer(_client, token);
        await ApiTestClient.CreateHandoffAsync(_client, "INB-1", "Inbox test item.");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<TurnoverLogDbContext>();
        var notification = Assert.Single(
            db.SupervisorNotifications.Where(n => n.SupervisorEmail == supervisor));
        Assert.Equal("Opened", notification.EventType);
        Assert.Equal("INB-1", notification.EquipmentTag);
    }

    [Fact]
    public async Task ResolveHandoff_WhenAlreadyResolved_ReturnsBadRequest()
    {
        await _factory.ResetDatabaseAsync();

        var token = await ApiTestClient.RegisterAndGetTokenAsync(
            _client,
            $"tech-{Guid.NewGuid():N}@test.local",
            "Test1234!");

        ApiTestClient.SetBearer(_client, token);

        var created = await ApiTestClient.CreateHandoffAsync(_client, "AC-01", "Test item.");
        await _client.PatchAsync($"/api/handoffs/{created.Id}/resolve", null);

        var secondResolve = await _client.PatchAsync($"/api/handoffs/{created.Id}/resolve", null);

        Assert.Equal(HttpStatusCode.BadRequest, secondResolve.StatusCode);
    }
}
