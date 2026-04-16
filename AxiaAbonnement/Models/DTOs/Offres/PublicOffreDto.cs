namespace AxiaAbonnement.Models.DTOs.Offres
{
    public class PublicOffreDto
    {
        public Guid Id { get; set; }
        public string IntituleOffre { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal ParMois { get; set; }
        public decimal ParAnnee { get; set; }
        public List<string> Services { get; set; } = new();
        public double? MoyenneNote { get; set; }
    }
}