namespace AxiaAbonnement.Models.Entities
{
    public class Offre
    {
        public Guid Id { get; set; }
        public string IntituleOffre { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal ParMois { get; set; }
        public decimal ParAnnee { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreePar { get; set; } = string.Empty;

        public DateTime? ModifieLe { get; set; }
        public string? ModifiePar { get; set; }

        public ICollection<ServiceOffre> ServiceOffres { get; set; } = [];
    }
}