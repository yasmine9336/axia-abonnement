using System.ComponentModel.DataAnnotations;
using AxiaAbonnement.Models.Validation;

namespace AxiaAbonnement.Models.DTOs.Offres
{
    public class CreateOffreDto
    {
        [Required]
        [MinWordCount(3, ErrorMessage = "L'intitulé doit contenir au moins 3 mots.")]
        public string IntituleOffre { get; set; } = string.Empty;

        [Required]
        [MinWordCount(10, ErrorMessage = "La description doit contenir au moins 10 mots.")]
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