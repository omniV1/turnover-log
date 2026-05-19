using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TurnoverLog.Api.Models;

namespace TurnoverLog.Api.Data;

public class TurnoverLogDbContext : IdentityDbContext<ApplicationUser>
{
    public TurnoverLogDbContext(DbContextOptions<TurnoverLogDbContext> options)
        : base(options)
    {
    }

    public DbSet<HandoffEntry> HandoffEntries => Set<HandoffEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<HandoffEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.EquipmentTag).HasMaxLength(64).IsRequired();
            entity.Property(e => e.Summary).HasMaxLength(2000).IsRequired();
            entity.Property(e => e.CreatedBy).HasMaxLength(128).IsRequired();
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Severity);
        });
    }
}
