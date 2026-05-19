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
    public DbSet<SupervisorNotification> SupervisorNotifications => Set<SupervisorNotification>();

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

        modelBuilder.Entity<SupervisorNotification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SupervisorEmail).HasMaxLength(256).IsRequired();
            entity.Property(e => e.EventType).HasMaxLength(32).IsRequired();
            entity.Property(e => e.Subject).HasMaxLength(500).IsRequired();
            entity.Property(e => e.EquipmentTag).HasMaxLength(64).IsRequired();
            entity.Property(e => e.Summary).HasMaxLength(2000).IsRequired();
            entity.HasIndex(e => e.SupervisorEmail);
            entity.HasIndex(e => e.CreatedAtUtc);
        });
    }
}
