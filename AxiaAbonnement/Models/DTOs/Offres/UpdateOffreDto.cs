namespace AxiaAbonnement.Models.DTOs.Offres
{
    public class UpdateOffreDto
    {
        public string? IntituleOffre { get; set; }
        public string? Description { get; set; }
        [System.ComponentModel.DataAnnotations.Range(0.01, double.MaxValue, ErrorMessage = "Le prix mensuel doit être supérieur à zéro.")]
        public decimal? ParMois { get; set; }

        [System.ComponentModel.DataAnnotations.Range(0.01, double.MaxValue, ErrorMessage = "Le prix annuel doit être supérieur à zéro.")]
        public decimal? ParAnnee { get; set; }
        public List<Guid>? ServiceIds { get; set; }
    }
}
