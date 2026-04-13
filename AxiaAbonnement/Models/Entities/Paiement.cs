namespace AxiaAbonnement.Models.Entities
{
    public class Paiement
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        // Subscription payment -> AbonnementId rempli
        // Responsable-account payment -> AbonnementId null
        public Guid? AbonnementId { get; set; }
        public Abonnement? Abonnement { get; set; }

        // Qui a payé
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public decimal Montant { get; set; }
        public string Statut { get; set; } = "pending"; // pending, completed, failed
        public string? StripePaymentIntentId { get; set; }

        // "subscription" | "responsable-account"
        public string PaymentType { get; set; } = "subscription";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}