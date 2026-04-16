namespace AxiaAbonnement.Models.DTOs.Services
{
    public class PublicServiceDto
    {
        public Guid Id { get; set; }
        public string IntituleService { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int NbOffres { get; set; }
        public decimal ParMois { get; set; }
        public decimal ParAnnee { get; set; }
        public double? MoyenneNote { get; set; }
    }
}