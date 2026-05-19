using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurnoverLog.Api.Data;
using TurnoverLog.Api.DTOs;
using TurnoverLog.Api.Extensions;
using TurnoverLog.Api.Models;
using TurnoverLog.Api.Services;

namespace TurnoverLog.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class HandoffsController : ControllerBase
{
    private readonly TurnoverLogDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly HandoffNotificationService _notifications;

    public HandoffsController(
        TurnoverLogDbContext db,
        ICurrentUserService currentUser,
        HandoffNotificationService notifications)
    {
        _db = db;
        _currentUser = currentUser;
        _notifications = notifications;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HandoffEntryDto>>> GetAll(
        [FromQuery] HandoffStatus? status,
        CancellationToken cancellationToken)
    {
        var query = _db.HandoffEntries.AsNoTracking();
        if (status.HasValue)
            query = query.Where(h => h.Status == status.Value);

        var entries = await query
            .OrderByDescending(h => h.Severity)
            .ThenByDescending(h => h.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return Ok(entries.Select(HandoffMapper.ToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<HandoffEntryDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var entry = await _db.HandoffEntries.AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == id, cancellationToken);

        return entry is null ? NotFound() : Ok(HandoffMapper.ToDto(entry));
    }

    [HttpPost]
    public async Task<ActionResult<HandoffEntryDto>> Create(
        [FromBody] CreateHandoffRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.EquipmentTag) || string.IsNullOrWhiteSpace(request.Summary))
            return BadRequest(new { message = "EquipmentTag and Summary are required." });

        var user = await _currentUser.GetUserAsync(cancellationToken);
        if (user is null)
            return Unauthorized();

        var entry = new HandoffEntry
        {
            Id = Guid.NewGuid(),
            EquipmentTag = request.EquipmentTag.Trim(),
            Summary = request.Summary.Trim(),
            Severity = request.Severity,
            Status = HandoffStatus.Open,
            CreatedByUserId = user.Id,
            CreatedBy = user.GetDisplayName(),
            CreatedAtUtc = DateTime.UtcNow,
        };

        _db.HandoffEntries.Add(entry);
        await _db.SaveChangesAsync(cancellationToken);

        await _notifications.NotifySupervisorAsync(
            entry,
            HandoffNotificationEvent.Opened,
            user,
            cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = entry.Id }, HandoffMapper.ToDto(entry));
    }

    [HttpPatch("{id:guid}/resolve")]
    public async Task<ActionResult<HandoffEntryDto>> Resolve(Guid id, CancellationToken cancellationToken)
    {
        var entry = await _db.HandoffEntries.FirstOrDefaultAsync(h => h.Id == id, cancellationToken);
        if (entry is null)
            return NotFound();

        if (entry.Status == HandoffStatus.Resolved)
            return BadRequest(new { message = "Handoff is already resolved." });

        var user = await _currentUser.GetUserAsync(cancellationToken);
        if (user is null)
            return Unauthorized();

        entry.Status = HandoffStatus.Resolved;
        entry.ResolvedAtUtc = DateTime.UtcNow;
        entry.ResolvedBy = user.GetDisplayName();
        await _db.SaveChangesAsync(cancellationToken);

        await _notifications.NotifySupervisorAsync(
            entry,
            HandoffNotificationEvent.Closed,
            user,
            cancellationToken);

        return Ok(HandoffMapper.ToDto(entry));
    }
}
