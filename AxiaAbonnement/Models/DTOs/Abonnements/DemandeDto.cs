namespace AxiaAbonnement.Models.DTOs.Abonnements
{
    public class DemandeDto
    {
        public Guid Id { get; set; }
        public Guid AbonnementId { get; set; }
        public string ClientUsername { get; set; } = "";
        public string ClientEmail { get; set; } = "";
        public string IntituleOffre { get; set; } = "";
        public string Type { get; set; } = "";
        public decimal Montant { get; set; }
        public string Statut { get; set; } = "";
        public DateTime CreatedAt { get; set; }
    }
}