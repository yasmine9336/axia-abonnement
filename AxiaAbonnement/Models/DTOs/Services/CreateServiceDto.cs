using System.ComponentModel.DataAnnotations;
using AxiaAbonnement.Models.Validation;

namespace AxiaAbonnement.Models.DTOs.Services
{
    public class CreateServiceDto
    {
        [Required]
        [MinWordCount(3, ErrorMessage = "L'intitulé doit contenir au moins 3 mots.")]
        public string IntituleService { get; set; } = string.Empty;

        [Required]
        [MinWordCount(10, ErrorMessage = "La description doit contenir au moins 10 mots.")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Le prix mensuel doit être supérieur à zéro.")]
        public decimal ParMois { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Le prix annuel doit être supérieur à zéro.")]
        public decimal ParAnnee { get; set; }
    }
}