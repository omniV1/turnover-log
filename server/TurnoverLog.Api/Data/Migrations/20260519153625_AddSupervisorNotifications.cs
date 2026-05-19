using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TurnoverLog.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSupervisorNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SupervisorNotifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SupervisorEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    HandoffId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    BodyHtml = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EquipmentTag = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EmailSent = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupervisorNotifications", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SupervisorNotifications_CreatedAtUtc",
                table: "SupervisorNotifications",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_SupervisorNotifications_SupervisorEmail",
                table: "SupervisorNotifications",
                column: "SupervisorEmail");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SupervisorNotifications");
        }
    }
}
