using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AxiaAbonnement.Migrations
{
    /// <inheritdoc />
    public partial class AddServicePricing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Abonnements_Offres_OffreId",
                table: "Abonnements");

            migrationBuilder.AddColumn<decimal>(
                name: "ParMois",
                table: "Services",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AlterColumn<Guid>(
                name: "OffreId",
                table: "Abonnements",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<Guid>(
                name: "ServiceId",
                table: "Abonnements",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Abonnements_ServiceId",
                table: "Abonnements",
                column: "ServiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Abonnements_Offres_OffreId",
                table: "Abonnements",
                column: "OffreId",
                principalTable: "Offres",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Abonnements_Services_ServiceId",
                table: "Abonnements",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Abonnements_Offres_OffreId",
                table: "Abonnements");

            migrationBuilder.DropForeignKey(
                name: "FK_Abonnements_Services_ServiceId",
                table: "Abonnements");

            migrationBuilder.DropIndex(
                name: "IX_Abonnements_ServiceId",
                table: "Abonnements");

            migrationBuilder.DropColumn(
                name: "ParMois",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "ServiceId",
                table: "Abonnements");

            migrationBuilder.AlterColumn<Guid>(
                name: "OffreId",
                table: "Abonnements",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Abonnements_Offres_OffreId",
                table: "Abonnements",
                column: "OffreId",
                principalTable: "Offres",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
