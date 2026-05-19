using System.Net;
using TurnoverLog.Api.Tests.Support;

namespace TurnoverLog.Api.Tests;

public class HealthEndpointTests : IClassFixture<TurnoverLogWebApplicationFactory>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(TurnoverLogWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetHealth_ReturnsOkWithoutAuth()
    {
        var response = await _client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("healthy", body, StringComparison.OrdinalIgnoreCase);
    }
}
