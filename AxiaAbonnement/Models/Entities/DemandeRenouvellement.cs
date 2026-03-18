namespace AxiaAbonnement.Models.Entities
{
    public class DemandeRenouvellement
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid AbonnementId { get; set; }
        public Abonnement Abonnement { get; set; } = null!;
        public Guid ClientId { get; set; }
        public User Client { get; set; } = null!;
        public string Statut { get; set; } = "en_attente"; // "en_attente", "acceptée", "refusée"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? TraiteeAt { get; set; }
    }
}