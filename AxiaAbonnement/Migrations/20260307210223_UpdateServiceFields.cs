using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AxiaAbonnement.Migrations
{
    /// <inheritdoc />
    public partial class UpdateServiceFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Services_Users_ResponsableId",
                table: "Services");

            migrationBuilder.DropIndex(
                name: "IX_Services_ResponsableId",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "Prix",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "ResponsableId",
                table: "Services");

            migrationBuilder.RenameColumn(
                name: "Nom",
                table: "Services",
                newName: "IntituleService");

            migrationBuilder.RenameColumn(
                name: "Duree",
                table: "Services",
                newName: "CreePar");

            migrationBuilder.AddColumn<string>(
                name: "CbModificateur",
                table: "Services",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CbModification",
                table: "Services",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CbModificateur",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "CbModification",
                table: "Services");

            migrationBuilder.RenameColumn(
                name: "IntituleService",
                table: "Services",
                newName: "Nom");

            migrationBuilder.RenameColumn(
                name: "CreePar",
                table: "Services",
                newName: "Duree");

            migrationBuilder.AddColumn<decimal>(
                name: "Prix",
                table: "Services",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "ResponsableId",
                table: "Services",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Services_ResponsableId",
                table: "Services",
                column: "ResponsableId");

            migrationBuilder.AddForeignKey(
                name: "FK_Services_Users_ResponsableId",
                table: "Services",
                column: "ResponsableId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
