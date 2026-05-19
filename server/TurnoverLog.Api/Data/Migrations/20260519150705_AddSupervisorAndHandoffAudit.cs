using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TurnoverLog.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSupervisorAndHandoffAudit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedByUserId",
                table: "HandoffEntries",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResolvedBy",
                table: "HandoffEntries",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SupervisorEmail",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "HandoffEntries");

            migrationBuilder.DropColumn(
                name: "ResolvedBy",
                table: "HandoffEntries");

            migrationBuilder.DropColumn(
                name: "SupervisorEmail",
                table: "AspNetUsers");
        }
    }
}
