using System.ComponentModel.DataAnnotations;
namespace AxiaAbonnement.Models.DTOs.Profile
{
    public class UpdateProfileDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public string? Gouvernorat { get; set; }
        public string? Ville { get; set; }
    }
}
