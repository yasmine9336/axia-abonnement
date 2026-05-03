namespace AxiaAbonnement.Models.DTOs.Offres
{
    public class UpdateOffreDto
    {
        public string? IntituleOffre { get; set; }
        public string? Description { get; set; }

        [System.ComponentModel.DataAnnotations.Range(1, 120)]
        public int? DureeEnMois { get; set; }

        [System.ComponentModel.DataAnnotations.Range(0.01, double.MaxValue)]
        public decimal? Prix { get; set; }
        public List<Guid>? ServiceIds { get; set; }
    }
}
