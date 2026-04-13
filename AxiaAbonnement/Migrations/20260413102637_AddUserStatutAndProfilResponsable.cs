using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AxiaAbonnement.Migrations
{
    /// <inheritdoc />
    public partial class AddUserStatutAndProfilResponsable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdresseProfessionnelle",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateAcceptation",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DatePaiementCompte",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MatriculeFiscal",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotifRefus",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NomEntreprise",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecteurActivite",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Statut",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdresseProfessionnelle",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DateAcceptation",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DatePaiementCompte",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "MatriculeFiscal",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "MotifRefus",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "NomEntreprise",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SecteurActivite",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Statut",
                table: "Users");
        }
    }
}
