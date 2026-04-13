using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AxiaAbonnement.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceResponsableOwnershipAndPaymentAdjustments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ResponsableId",
                table: "Services",
                type: "uniqueidentifier",
                nullable: true);

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
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Services_Users_ResponsableId",
                table: "Services");

            migrationBuilder.DropIndex(
                name: "IX_Services_ResponsableId",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "ResponsableId",
                table: "Services");
        }
    }
}
