using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AxiaAbonnement.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFeedbackAddAbonnementRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AbonnementId",
                table: "Feedbacks",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Feedbacks_AbonnementId",
                table: "Feedbacks",
                column: "AbonnementId");

            migrationBuilder.AddForeignKey(
                name: "FK_Feedbacks_Abonnements_AbonnementId",
                table: "Feedbacks",
                column: "AbonnementId",
                principalTable: "Abonnements",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Feedbacks_Abonnements_AbonnementId",
                table: "Feedbacks");

            migrationBuilder.DropIndex(
                name: "IX_Feedbacks_AbonnementId",
                table: "Feedbacks");

            migrationBuilder.DropColumn(
                name: "AbonnementId",
                table: "Feedbacks");
        }
    }
}
