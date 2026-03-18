using System.ComponentModel.DataAnnotations;
namespace AxiaAbonnement.Models.DTOs.Profile 
{
    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        public string NewPassword { get; set; } = string.Empty;

        [Required]
        [Compare("NewPassword", ErrorMessage = "Les mots de passe ne correspondent pas.")]
        public string ConfirmPassword { get; set;} = string.Empty;
    }
}
