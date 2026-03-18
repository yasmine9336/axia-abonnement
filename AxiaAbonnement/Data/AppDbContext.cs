using Microsoft.EntityFrameworkCore;
using AxiaAbonnement.Models.Entities;

namespace AxiaAbonnement.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<Offre> Offres { get; set; }
        public DbSet<ServiceOffre> ServiceOffres { get; set; }
        public DbSet<Abonnement> Abonnements { get; set; }
        public DbSet<Paiement> Paiements { get; set; }
        public DbSet<DemandeRenouvellement> DemandesRenouvellement { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ServiceOffre>(entity =>
            {
                entity.HasKey(so => new { so.ServiceId, so.OffreId });

                entity.HasOne(so => so.Service)
                    .WithMany(s => s.ServiceOffres)
                    .HasForeignKey(so => so.ServiceId);

                entity.HasOne(so => so.Offre)
                    .WithMany(o => o.ServiceOffres)
                    .HasForeignKey(so => so.OffreId);
            });

            modelBuilder.Entity<Offre>(entity =>
            {
                entity.Property(o => o.ParMois).HasPrecision(18, 2);
                entity.Property(o => o.ParAnnee).HasPrecision(18, 2);
            });

            modelBuilder.Entity<Service>(entity =>
            {
                entity.Property(s => s.ParAnnee).HasPrecision(18, 2);
            });

            modelBuilder.Entity<Abonnement>(entity =>
            {
                entity.HasOne(a => a.User)
                    .WithMany()
                    .HasForeignKey(a => a.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Offre)
                    .WithMany()
                    .HasForeignKey(a => a.OffreId);

                entity.Property(a => a.Montant).HasPrecision(18, 2);
            });

            modelBuilder.Entity<Paiement>(entity =>
            {
                entity.HasOne(p => p.Abonnement)
                    .WithMany()
                    .HasForeignKey(p => p.AbonnementId);

                entity.Property(p => p.Montant).HasPrecision(18, 2);
            });

            modelBuilder.Entity<DemandeRenouvellement>(entity =>
            {
                entity.HasOne(d => d.Client)
                    .WithMany()
                    .HasForeignKey(d => d.ClientId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}