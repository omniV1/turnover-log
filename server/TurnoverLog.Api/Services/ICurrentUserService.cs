using TurnoverLog.Api.Models;

namespace TurnoverLog.Api.Services;

public interface ICurrentUserService
{
    Task<ApplicationUser?> GetUserAsync(CancellationToken cancellationToken = default);
}
