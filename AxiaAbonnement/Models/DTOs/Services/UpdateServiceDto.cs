using System.ComponentModel.DataAnnotations;
namespace AxiaAbonnement.Models.DTOs.Services
{
    public class UpdateServiceDto
    {
        public string? IntituleService { get; set; }
        public string? Description { get; set; }
    }
}
