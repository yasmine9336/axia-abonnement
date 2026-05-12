using System.ComponentModel.DataAnnotations;
using AxiaAbonnement.Models.Validation;

namespace AxiaAbonnement.Models.DTOs.Offres
{
    public class UpdateOffreDto
    {
        [MinWordCount(3, ErrorMessage = "L'intitulé doit contenir au moins 3 mots.")]
        public string? IntituleOffre { get; set; }

        [MinWordCount(10, ErrorMessage = "La description doit contenir au moins 10 mots.")]
        public string? Description { get; set; }

        [Range(1, 120)]
        public int? DureeEnMois { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal? Prix { get; set; }

        public List<Guid>? ServiceIds { get; set; }
    }
}