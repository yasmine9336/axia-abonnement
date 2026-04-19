namespace AxiaAbonnement.Models.DTOs.Abonnements
{
    /// <summary>
    /// Utilisé par le client (ClientUsername/Email = null)
    /// et par le responsable (ClientUsername/Email = remplis)
    /// </summary>
    public class AbonnementDto
    {
        public Guid Id { get; set; }
        public string IntituleOffre { get; set; } = "";
        public string Description { get; set; } = "";
        public string Type { get; set; } = "";
        public decimal Montant { get; set; }
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public bool IsActive { get; set; }
        public string Statut { get; set; } = ""; // "actif","suspendu","expiré"

        // Remplis seulement pour le responsable
        public string? ClientUsername { get; set; }
        public string? ClientEmail { get; set; }
        public string? ResponsableUsername { get; set; }
    }
}
