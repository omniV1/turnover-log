using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TurnoverLog.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HandoffEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EquipmentTag = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Severity = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ResolvedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HandoffEntries", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HandoffEntries_Severity",
                table: "HandoffEntries",
                column: "Severity");

            migrationBuilder.CreateIndex(
                name: "IX_HandoffEntries_Status",
                table: "HandoffEntries",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HandoffEntries");
        }
    }
}
