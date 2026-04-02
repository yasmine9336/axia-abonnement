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
            migrationBuilder.Sql(@"
        IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Abonnements_Offres_OfffreId')
            ALTER TABLE [Abonnements] DROP CONSTRAINT [FK_Abonnements_Offres_OfffreId];
        IF COL_LENGTH('Abonnements', 'OfffreId') IS NOT NULL AND COL_LENGTH('Abonnements', 'OffreId') IS NULL
            EXEC sp_rename N'[Abonnements].[OfffreId]', N'OffreId', 'COLUMN';
        IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Abonnements_OfffreId' AND object_id = OBJECT_ID('Abonnements'))
            AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Abonnements_OffreId' AND object_id = OBJECT_ID('Abonnements'))
             EXEC sp_rename N'[Abonnements].[IX_Abonnements_OfffreId]', N'IX_Abonnements_OffreId', N'INDEX';

        IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Abonnements_Offres_OffreId')
            ALTER TABLE [Abonnements]
            ADD CONSTRAINT [FK_Abonnements_Offres_OffreId]
            FOREIGN KEY ([OffreId]) REFERENCES [Offres]([Id]) ON DELETE CASCADE;
        ");
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