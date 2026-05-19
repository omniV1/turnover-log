using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TurnoverLog.Api.Data;
using TurnoverLog.Api.DTOs;
using TurnoverLog.Api.Models;

namespace TurnoverLog.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class HandoffsController : ControllerBase
{
    private readonly TurnoverLogDbContext _db;

    public HandoffsController(TurnoverLogDbContext db) => _db = db;

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

        return Ok(entries.Select(Map));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<HandoffEntryDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var entry = await _db.HandoffEntries.AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == id, cancellationToken);

        return entry is null ? NotFound() : Ok(Map(entry));
    }

    [HttpPost]
    public async Task<ActionResult<HandoffEntryDto>> Create(
        [FromBody] CreateHandoffRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.EquipmentTag) || string.IsNullOrWhiteSpace(request.Summary))
            return BadRequest(new { message = "EquipmentTag and Summary are required." });

        var entry = new HandoffEntry
        {
            Id = Guid.NewGuid(),
            EquipmentTag = request.EquipmentTag.Trim(),
            Summary = request.Summary.Trim(),
            Severity = request.Severity,
            Status = HandoffStatus.Open,
            CreatedBy = GetCurrentUserDisplayName(),
            CreatedAtUtc = DateTime.UtcNow,
        };

        _db.HandoffEntries.Add(entry);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = entry.Id }, Map(entry));
    }

    [HttpPatch("{id:guid}/resolve")]
    public async Task<ActionResult<HandoffEntryDto>> Resolve(Guid id, CancellationToken cancellationToken)
    {
        var entry = await _db.HandoffEntries.FirstOrDefaultAsync(h => h.Id == id, cancellationToken);
        if (entry is null)
            return NotFound();

        entry.Status = HandoffStatus.Resolved;
        entry.ResolvedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);

        return Ok(Map(entry));
    }

    private string GetCurrentUserDisplayName() =>
        User.FindFirstValue(ClaimTypes.Name)
        ?? User.FindFirstValue(ClaimTypes.Email)
        ?? User.Identity?.Name
        ?? "unknown";

    private static HandoffEntryDto Map(HandoffEntry e) =>
        new(e.Id, e.EquipmentTag, e.Summary, e.Severity, e.Status, e.CreatedBy, e.CreatedAtUtc, e.ResolvedAtUtc);
}
