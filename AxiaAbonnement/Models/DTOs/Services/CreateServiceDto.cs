using System.ComponentModel.DataAnnotations;
namespace AxiaAbonnement.Models.DTOs.Services
{
    public class CreateServiceDto
    {
        [Required]
        public string IntituleService { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

    }
}
