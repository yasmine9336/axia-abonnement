namespace AxiaAbonnement.Models.DTOs.Services
{
    public class ServiceResponsableDto
    {
        public Guid Id { get; set; }
        public string IntituleService { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreePar { get; set; } = string.Empty;
        public DateTime? CbModification { get; set; }
        public string? CbModificateur { get; set; }
        public int NbOffres { get; set; }
    }
}
