using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AxiaAbonnement.Migrations
{
    /// <inheritdoc />
    public partial class ChangeOffreToDureeAndPrix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ParAnnee",
                table: "Offres");

            migrationBuilder.RenameColumn(
                name: "ParMois",
                table: "Offres",
                newName: "Prix");

            migrationBuilder.AddColumn<int>(
                name: "DureeEnMois",
                table: "Offres",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DureeEnMois",
                table: "Offres");

            migrationBuilder.RenameColumn(
                name: "Prix",
                table: "Offres",
                newName: "ParMois");

            migrationBuilder.AddColumn<decimal>(
                name: "ParAnnee",
                table: "Offres",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }
    }
}
