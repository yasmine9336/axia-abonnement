using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AxiaAbonnement.Migrations
{
    /// <inheritdoc />
    public partial class FixOfffreIdColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Abonnements_Offres_OfffreId",
                table: "Abonnements");

            migrationBuilder.RenameColumn(
                name: "OfffreId",
                table: "Abonnements",
                newName: "OffreId");

            migrationBuilder.RenameIndex(
                name: "IX_Abonnements_OfffreId",
                table: "Abonnements",
                newName: "IX_Abonnements_OffreId");

            migrationBuilder.AddForeignKey(
                name: "FK_Abonnements_Offres_OffreId",
                table: "Abonnements",
                column: "OffreId",
                principalTable: "Offres",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Abonnements_Offres_OffreId",
                table: "Abonnements");

            migrationBuilder.RenameColumn(
                name: "OffreId",
                table: "Abonnements",
                newName: "OfffreId");

            migrationBuilder.RenameIndex(
                name: "IX_Abonnements_OffreId",
                table: "Abonnements",
                newName: "IX_Abonnements_OfffreId");

            migrationBuilder.AddForeignKey(
                name: "FK_Abonnements_Offres_OfffreId",
                table: "Abonnements",
                column: "OfffreId",
                principalTable: "Offres",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}