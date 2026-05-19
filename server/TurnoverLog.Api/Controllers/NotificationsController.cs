using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurnoverLog.Api.Data;
using TurnoverLog.Api.DTOs;
using TurnoverLog.Api.Services;

namespace TurnoverLog.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly TurnoverLogDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public NotificationsController(TurnoverLogDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Inbox for supervisors — log in with the same email technicians list as their supervisor.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SupervisorNotificationDto>>> GetInbox(
        CancellationToken cancellationToken)
    {
        var user = await _currentUser.GetUserAsync(cancellationToken);
        if (user?.Email is null)
            return Unauthorized();

        var supervisorEmail = user.Email.Trim().ToLowerInvariant();

        var items = await _db.SupervisorNotifications
            .AsNoTracking()
            .Where(n => n.SupervisorEmail.ToLower() == supervisorEmail)
            .OrderByDescending(n => n.CreatedAtUtc)
            .Take(50)
            .Select(n => new SupervisorNotificationDto(
                n.Id,
                n.HandoffId,
                n.EventType,
                n.Subject,
                n.EquipmentTag,
                n.Summary,
                n.CreatedAtUtc,
                n.EmailSent))
            .ToListAsync(cancellationToken);

        return Ok(items);
    }
}
