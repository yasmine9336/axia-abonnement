using System.ComponentModel.DataAnnotations;

namespace AxiaAbonnement.Models.DTOs.Auth
{
    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string ClientUri { get; set; } = string.Empty;

    }
}
