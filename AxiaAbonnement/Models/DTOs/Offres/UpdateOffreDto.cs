namespace AxiaAbonnement.Models.DTOs.Offres
{
    public class UpdateOffreDto
    {
        public string? IntituleOffre { get; set; }
        public string? Description { get; set; }
        public decimal? ParMois { get; set; }
        public decimal? ParAnnee { get; set; }
        public List<Guid>? ServiceIds { get; set; }
    }
}
