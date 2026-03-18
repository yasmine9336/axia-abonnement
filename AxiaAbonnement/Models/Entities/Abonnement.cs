namespace AxiaAbonnement.Models.Entities
{
    public class Abonnement
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public Guid OffreId { get; set; }
        public Offre Offre { get; set; } = null!;
        public string Type { get; set; } = "mensuel"; // ou "annuel"
        public decimal Montant { get; set; }
        public DateTime DateDebut { get; set; } = DateTime.UtcNow;
        public DateTime DateFin { get; set; }
        public bool IsActive { get; set; } = true;
        public string? StripeSessionId { get; set; }
        public string? StripeSubscriptionId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
