namespace AxiaAbonnement.Models.DTOs.Services
{
    public class UpdateServiceDto
    {
        public string? IntituleService { get; set; }
        public string? Description { get; set; }
        public decimal? ParMois { get; set; }
        public decimal? ParAnnee { get; set; }
    }
}
