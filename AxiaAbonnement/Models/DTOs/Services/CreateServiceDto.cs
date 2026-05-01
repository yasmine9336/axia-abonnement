using System.ComponentModel.DataAnnotations;
namespace AxiaAbonnement.Models.DTOs.Services
{
    public class CreateServiceDto
    {
        [Required]
        public string IntituleService { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Le prix mensuel doit être supérieur à zéro.")]
        public decimal ParMois { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Le prix annuel doit être supérieur à zéro.")]
        public decimal ParAnnee { get; set; }

    }
}
