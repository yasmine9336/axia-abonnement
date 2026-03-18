using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AxiaAbonnement.Migrations
{
    /// <inheritdoc />
    public partial class AddRestrictDeleteAbonnement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Abonnements_Users_UserId",
                table: "Abonnements");

            migrationBuilder.AddForeignKey(
                name: "FK_Abonnements_Users_UserId",
                table: "Abonnements",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Abonnements_Users_UserId",
                table: "Abonnements");

            migrationBuilder.AddForeignKey(
                name: "FK_Abonnements_Users_UserId",
                table: "Abonnements",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
