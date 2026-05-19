using Microsoft.AspNetCore.Identity;

namespace TurnoverLog.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string? DisplayName { get; set; }

    /// <summary>Supervisor notified when this user opens or closes a handoff.</summary>
    public string? SupervisorEmail { get; set; }
}
