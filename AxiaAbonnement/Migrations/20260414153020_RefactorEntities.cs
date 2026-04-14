using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AxiaAbonnement.Migrations
{
    /// <inheritdoc />
    public partial class RefactorEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Abonnements_Services_ServiceId",
                table: "Abonnements");

            migrationBuilder.RenameColumn(
                name: "RefreshToken",
                table: "Users",
                newName: "RefreshTokenHash");

            migrationBuilder.RenameColumn(
                name: "CbModification",
                table: "Services",
                newName: "ModifieLe");

            migrationBuilder.RenameColumn(
                name: "CbModificateur",
                table: "Services",
                newName: "ModifiePar");

            migrationBuilder.RenameColumn(
                name: "CbModification",
                table: "Offres",
                newName: "ModifieLe");

            migrationBuilder.RenameColumn(
                name: "CbModificateur",
                table: "Offres",
                newName: "ModifiePar");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "Statut",
                table: "Abonnements",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Abonnement_OffreOrService",
                table: "Abonnements",
                sql: "(OffreId IS NOT NULL AND ServiceId IS NULL) OR (OffreId IS NULL AND ServiceId IS NOT NULL)");

            migrationBuilder.AddForeignKey(
                name: "FK_Abonnements_Services_ServiceId",
                table: "Abonnements",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Abonnements_Services_ServiceId",
                table: "Abonnements");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Abonnement_OffreOrService",
                table: "Abonnements");

            migrationBuilder.DropColumn(
                name: "Statut",
                table: "Abonnements");

            migrationBuilder.RenameColumn(
                name: "RefreshTokenHash",
                table: "Users",
                newName: "RefreshToken");

            migrationBuilder.RenameColumn(
                name: "ModifiePar",
                table: "Services",
                newName: "CbModificateur");

            migrationBuilder.RenameColumn(
                name: "ModifieLe",
                table: "Services",
                newName: "CbModification");

            migrationBuilder.RenameColumn(
                name: "ModifiePar",
                table: "Offres",
                newName: "CbModificateur");

            migrationBuilder.RenameColumn(
                name: "ModifieLe",
                table: "Offres",
                newName: "CbModification");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddForeignKey(
                name: "FK_Abonnements_Services_ServiceId",
                table: "Abonnements",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id");
        }
    }
}
