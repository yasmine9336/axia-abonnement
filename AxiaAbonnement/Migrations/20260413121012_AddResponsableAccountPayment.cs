using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AxiaAbonnement.Migrations
{
    /// <inheritdoc />
    public partial class AddResponsableAccountPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Paiements_Abonnements_AbonnementId",
                table: "Paiements");

            migrationBuilder.AlterColumn<Guid>(
                name: "AbonnementId",
                table: "Paiements",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<string>(
                name: "PaymentType",
                table: "Paiements",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Paiements",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Paiements_UserId",
                table: "Paiements",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Paiements_Abonnements_AbonnementId",
                table: "Paiements",
                column: "AbonnementId",
                principalTable: "Abonnements",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Paiements_Users_UserId",
                table: "Paiements",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Paiements_Abonnements_AbonnementId",
                table: "Paiements");

            migrationBuilder.DropForeignKey(
                name: "FK_Paiements_Users_UserId",
                table: "Paiements");

            migrationBuilder.DropIndex(
                name: "IX_Paiements_UserId",
                table: "Paiements");

            migrationBuilder.DropColumn(
                name: "PaymentType",
                table: "Paiements");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Paiements");

            migrationBuilder.AlterColumn<Guid>(
                name: "AbonnementId",
                table: "Paiements",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Paiements_Abonnements_AbonnementId",
                table: "Paiements",
                column: "AbonnementId",
                principalTable: "Abonnements",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
