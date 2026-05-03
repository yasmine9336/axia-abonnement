using System.ComponentModel.DataAnnotations;
namespace AxiaAbonnement.Models.DTOs.Offres
{
    public class CreateOffreDto
    {
        [Required]
        public string IntituleOffre { get; set; } = string.Empty;
        [Required]
        public string Description { get; set; } = string.Empty;
        [Required]
        [Range(1, 120, ErrorMessage = "La durée doit être entre 1 et 120 mois.")]
        public int DureeEnMois { get; set; }
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Le prix doit être supérieur à zéro.")]
        public decimal Prix { get; set; }
        public List<Guid> ServiceIds { get; set; } = new();
    }
}
