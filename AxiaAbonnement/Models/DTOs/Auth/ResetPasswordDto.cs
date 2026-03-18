using System.ComponentModel.DataAnnotations;

namespace AxiaAbonnement.Models.DTOs.Auth
{
    public class ResetPasswordDto
    {
        [Required]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Token { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password", ErrorMessage = "Les mots de passes ne correspondent pas")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
