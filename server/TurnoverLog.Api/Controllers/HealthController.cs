using Microsoft.AspNetCore.Mvc;

namespace TurnoverLog.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() =>
        Ok(new { status = "healthy", service = "TurnoverLog.Api", utc = DateTime.UtcNow });
}
