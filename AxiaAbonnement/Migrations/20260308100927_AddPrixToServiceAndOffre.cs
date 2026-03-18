using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AxiaAbonnement.Migrations
{
    /// <inheritdoc />
    public partial class AddPrixToServiceAndOffre : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Par3Mois",
                table: "Services",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Par6Mois",
                table: "Services",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ParAnnee",
                table: "Services",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ParMois",
                table: "Services",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Par3Mois",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "Par6Mois",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "ParAnnee",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "ParMois",
                table: "Services");
        }
    }
}
