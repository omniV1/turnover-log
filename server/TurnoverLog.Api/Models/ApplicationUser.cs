using Microsoft.AspNetCore.Identity;

namespace TurnoverLog.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string? DisplayName { get; set; }
}
