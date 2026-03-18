namespace AxiaAbonnement.Models.DTOs.Services
{
    public class PublicServiceDto
    {
        public Guid Id { get; set; }
        public string IntituleService { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int NbOffres { get; set; }
    }
}