using Microsoft.EntityFrameworkCore;
using TurnoverLog.Api.Configuration;

namespace TurnoverLog.Api.Data;

/// <summary>
/// Adds SupervisorNotifications on PostgreSQL when the DB was created before this table existed.
/// </summary>
public static class NotificationSchemaBootstrap
{
    public static async Task EnsureAsync(TurnoverLogDbContext db, DatabaseProvider provider)
    {
        if (provider != DatabaseProvider.PostgreSql)
            return;

        await db.Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "SupervisorNotifications" (
                "Id" UUID NOT NULL PRIMARY KEY,
                "SupervisorEmail" VARCHAR(256) NOT NULL,
                "HandoffId" UUID NOT NULL,
                "EventType" VARCHAR(32) NOT NULL,
                "Subject" VARCHAR(500) NOT NULL,
                "BodyHtml" TEXT NOT NULL,
                "EquipmentTag" VARCHAR(64) NOT NULL,
                "Summary" VARCHAR(2000) NOT NULL,
                "CreatedAtUtc" TIMESTAMP NOT NULL,
                "EmailSent" BOOLEAN NOT NULL
            );
            CREATE INDEX IF NOT EXISTS "IX_SupervisorNotifications_SupervisorEmail"
                ON "SupervisorNotifications" ("SupervisorEmail");
            CREATE INDEX IF NOT EXISTS "IX_SupervisorNotifications_CreatedAtUtc"
                ON "SupervisorNotifications" ("CreatedAtUtc");
            """);
    }
}
