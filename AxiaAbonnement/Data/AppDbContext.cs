using AxiaAbonnement.Models.Entities;
using Microsoft.EntityFrameworkCore;

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
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<ChatConversation> ChatConversations { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ServiceOffre
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

            // Offre
            modelBuilder.Entity<Offre>(entity =>
            {
                entity.Property(o => o.ParMois).HasPrecision(18, 2);
                entity.Property(o => o.ParAnnee).HasPrecision(18, 2);
            });

            // Service
            modelBuilder.Entity<Service>(entity =>
            {
                entity.Property(s => s.ParMois).HasPrecision(18, 2);
                entity.Property(s => s.ParAnnee).HasPrecision(18, 2);

                entity.HasOne(s => s.Responsable)
                    .WithMany()
                    .HasForeignKey(s => s.ResponsableId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);

                // Navigation vers Abonnements
                entity.HasMany(s => s.Abonnements)
                    .WithOne(a => a.Service)
                    .HasForeignKey(a => a.ServiceId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);
            });

            // Abonnement
            modelBuilder.Entity<Abonnement>(entity =>
            {
                entity.ToTable(t => t.HasCheckConstraint(
                    "CK_Abonnement_OffreOrService",
                    "(OffreId IS NOT NULL AND ServiceId IS NULL) OR (OffreId IS NULL AND ServiceId IS NOT NULL)"
                ));

                entity.HasOne(a => a.User)
                    .WithMany(u => u.Abonnements)
                    .HasForeignKey(a => a.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Offre)
                    .WithMany()
                    .HasForeignKey(a => a.OffreId)
                    .IsRequired(false);

                entity.HasOne(a => a.Service)
                    .WithMany(s => s.Abonnements)
                    .HasForeignKey(a => a.ServiceId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);

                entity.Property(a => a.Montant).HasPrecision(18, 2);

                entity.Property(a => a.Statut)
                    .HasConversion<string>()
                    .HasMaxLength(20);
            });

            // Paiement
            modelBuilder.Entity<Paiement>(entity =>
            {
                entity.HasOne(p => p.Abonnement)
                    .WithMany()
                    .HasForeignKey(p => p.AbonnementId)
                    .IsRequired(false);

                entity.HasOne(p => p.User)
                    .WithMany()
                    .HasForeignKey(p => p.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(p => p.Montant).HasPrecision(18, 2);
            });

            // DemandeRenouvellement
            modelBuilder.Entity<DemandeRenouvellement>(entity =>
            {
                entity.HasOne(d => d.Client)
                    .WithMany()
                    .HasForeignKey(d => d.ClientId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Feedback
            modelBuilder.Entity<Feedback>(entity =>
            {
                entity.HasOne(f => f.Client)
                    .WithMany()
                    .HasForeignKey(f => f.ClientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(f => f.Abonnement)
                    .WithMany()
                    .HasForeignKey(f => f.AbonnementId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // User
            modelBuilder.Entity<User>(entity =>
            {
                // StatutCompte comme string
                entity.Property(u => u.Statut)
                    .HasConversion<string>()
                    .HasMaxLength(20);

                // UserRole comme string
                entity.Property(u => u.Role)
                    .HasConversion<string>()
                    .HasMaxLength(20);

                // Index unique sur Email
                entity.HasIndex(u => u.Email)
                    .IsUnique();

                // Navigation Abonnements
                entity.HasMany(u => u.Abonnements)
                    .WithOne(a => a.User)
                    .HasForeignKey(a => a.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ChatConversation 
            modelBuilder.Entity<ChatConversation>(entity =>
            {
                entity.HasOne(c => c.Client)
                    .WithMany()
                    .HasForeignKey(c => c.ClientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.AssignedResponsable)
                    .WithMany()
                    .HasForeignKey(c => c.AssignedResponsableId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);
            });

            // ChatMessage
            modelBuilder.Entity<ChatMessage>(entity =>
            {
                entity.HasOne(m => m.Conversation)
                    .WithMany(c => c.Messages)
                    .HasForeignKey(m => m.ConversationId);

                entity.HasOne(m => m.SenderUser)
                    .WithMany()
                    .HasForeignKey(m => m.SenderUserId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);
            });
        }
    }
}