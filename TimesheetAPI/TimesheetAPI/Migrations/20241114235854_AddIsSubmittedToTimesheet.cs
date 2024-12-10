using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimesheetAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddIsSubmittedToTimesheet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_SiteDetails",
                table: "SiteDetails");

            migrationBuilder.AddColumn<bool>(
                name: "IsSubmitted",
                table: "TimeSheets",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "SiteID",
                table: "SiteDetails",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<int>(
                name: "SiteDetailID",
                table: "SiteDetails",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SiteDetails",
                table: "SiteDetails",
                column: "SiteDetailID");

            migrationBuilder.CreateTable(
                name: "TimeEntries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TimeFor = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FinishTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    JobNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PlantNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SMHStart = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SMHFinish = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Details = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimeEntries", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TimeEntries");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SiteDetails",
                table: "SiteDetails");

            migrationBuilder.DropColumn(
                name: "IsSubmitted",
                table: "TimeSheets");

            migrationBuilder.DropColumn(
                name: "SiteDetailID",
                table: "SiteDetails");

            migrationBuilder.AlterColumn<string>(
                name: "SiteID",
                table: "SiteDetails",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SiteDetails",
                table: "SiteDetails",
                column: "SiteID");
        }
    }
}
