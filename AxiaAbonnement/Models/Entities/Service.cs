namespace AxiaAbonnement.Models.Entities
{
    public class Service
    {
        public Guid Id { get; set; }
        public string IntituleService { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal ParMois { get; set; }
        public decimal ParAnnee { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreePar { get; set; } = string.Empty;
        public DateTime? CbModification { get; set; }
        public string? CbModificateur { get; set; }
        public ICollection<ServiceOffre> ServiceOffres { get; set; } = new List<ServiceOffre>();
        public Guid? ResponsableId { get; set; }
        public User? Responsable { get; set; }
    }

}