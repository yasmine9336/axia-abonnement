namespace AxiaAbonnement.Models.Entities
{
    public class Paiement
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid AbonnementId { get; set; }
        public Abonnement Abonnement { get; set; } = null!;
        public decimal Montant { get; set; }
        public string Statut { get; set; } = "pending"; // "pending", "succeeded", "failed"
        public string? StripePaymentIntentId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
