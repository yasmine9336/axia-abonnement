using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AxiaAbonnement.Migrations
{
    /// <inheritdoc />
    public partial class AddNbUsersToService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "NbUsers",
                table: "Services",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NbUsers",
                table: "Services");
        }
    }
}
