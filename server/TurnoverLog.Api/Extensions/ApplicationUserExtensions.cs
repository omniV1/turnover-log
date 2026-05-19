using TurnoverLog.Api.Models;

namespace TurnoverLog.Api.Extensions;

public static class ApplicationUserExtensions
{
    public static string GetDisplayName(this ApplicationUser user) =>
        user.DisplayName ?? user.Email ?? "unknown";
}
