using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarParking.Migrations
{
    /// <inheritdoc />
    public partial class AddRegisteredVRMsToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RegisteredVRMs",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RegisteredVRMs",
                table: "Users");
        }
    }
}
